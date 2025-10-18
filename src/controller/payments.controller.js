const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Payment, Course, User } = require("@models");
const paymentsService = require("@services/payments.service");

const payment = async (req, res) => {
    try {
        const courseId = req.params.courseId || req.body.courseId;
        if (!courseId)
            return res.status(400).json({ message: "Missing courseId" });

        const session = await paymentsService.createSession(req.user, courseId);
        return res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: error.message || "Failed to create session" });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({ message: "Missing session ID" });
        }

        console.log(
            "Available methods in paymentsService:",
            Object.keys(paymentsService)
        );
        console.log("Attempting to verify session:", sessionId);

        // Verify the payment session
        const payment = await paymentsService.verifyPaymentSession(sessionId);

        return res.json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify payment",
        });
    }
};

// webhook endpoint for stripe events
const webhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event = null;

    try {
        if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
            // prefer rawBody (setup in server) otherwise use body
            const raw = req.rawBody || JSON.stringify(req.body);
            event = stripe.webhooks.constructEvent(
                raw,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } else {
            event = req.body;
        }
    } catch (err) {
        console.error("Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        await paymentsService.handleStripeEvent(event);
        return res.json({ received: true });
    } catch (err) {
        console.error("Error handling stripe event", err);
        return res.status(500).json({ message: "Failed to handle event" });
    }
};

module.exports = {
    payment,
    webhook,
    verifyPayment,
};
