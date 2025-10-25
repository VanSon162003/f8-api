const Stripe = require("stripe");
const { Payment, Course, User } = require("@models");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const coursesService = require("./courses.service");

const ensureHttpUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `http://${url}`;
};

const createSession = async (currentUser, courseId) => {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error("Course not found");

    const frontendUrl = ensureHttpUrl(
        process.env.FRONTEND_URL || "http://localhost:5173"
    );
    if (!frontendUrl) throw new Error("Invalid FRONTEND_URL configuration");

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: process.env.PAYMENT_CURRENCY || "vnd",
                    product_data: { name: course.title },
                    unit_amount: Math.ceil(course.price || 0),
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/payment/cancel`,
        metadata: {
            user_id: currentUser?.id || "",
            course_id: courseId,
        },
    });

    // create payment pending record
    const payment = await Payment.create({
        user_id: currentUser?.id || null,
        course_id: courseId,
        amount: course.price || 0,
        status: "pending",
        payment_id: null,
        currency: process.env.PAYMENT_CURRENCY || "vnd",
        stripe_session_id: session.id,
    });

    return session;
};

const verifyPaymentSession = async (sessionId) => {
    try {
        // Find payment in database
        const payment = await Payment.findOne({
            where: { stripe_session_id: sessionId },
            logging: console.log, // Log the SQL query
        });

        if (!payment) {
            // Double check the session with Stripe
            await stripe.checkout.sessions.retrieve(sessionId);
            throw new Error("Payment not found in database");
        }

        // If payment is still pending, check with Stripe
        if (payment.status === "pending") {
            // Retrieve the session from Stripe
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            // Update payment status based on session status
            switch (session.payment_status) {
                case "paid":
                    payment.status = "succeeded";
                    payment.payed_at = new Date();
                    payment.payment_id = session.payment_intent;
                    await payment.save();

                    // Proceed with course enrollment if not already enrolled
                    const course = await Course.findByPk(payment.course_id);
                    const user = await User.findByPk(payment.user_id);

                    if (course && user) {
                        // await user.addCourse(course);

                        await coursesService.registerCourse(user, course.id);
                    }
                    break;

                case "unpaid":
                case "canceled":
                    payment.status = "failed";
                    await payment.save();
                    break;

                default:
                    // Keep as pending if status is unclear
                    break;
            }
        }

        return payment;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw error;
    }
};

const handleStripeEvent = async (event) => {
    // Handle relevant event types
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const sessionId = session.id;
            const metadata = session.metadata || {};

            // find payment record by stripe_session_id
            const payment = await Payment.findOne({
                where: { stripe_session_id: sessionId },
            });
            if (payment) {
                payment.status = "succeeded";
                payment.payment_id =
                    session.payment_intent || session.payment_method || null;
                payment.payed_at = new Date();
                await payment.save();

                // enroll user to course if user exists
                const userId = metadata.user_id || payment.user_id;
                const courseId = metadata.course_id || payment.course_id;
                if (userId && courseId) {
                    const user = await User.findByPk(userId);
                    const course = await Course.findByPk(courseId);

                    if (user && course) {
                        // await user.addCourse(course);

                        await coursesService.registerCourse(user, course.id);
                        // add course progress and set current lesson (reuse courses.service registerCourse logic if needed)
                    }
                }
            }
            break;
        }

        case "payment_intent.payment_failed": {
            const intent = event.data.object;
            // try to map to payment via metadata or charge
            const sessionId = intent.metadata?.session_id;
            if (sessionId) {
                const payment = await Payment.findOne({
                    where: { stripe_session_id: sessionId },
                });
                if (payment) {
                    payment.status = "failed";
                    await payment.save();
                }
            }
            break;
        }

        case "checkout.session.expired":
        case "checkout.session.async_payment_failed":
        case "checkout.session.async_payment_canceled": {
            const session = event.data.object;
            const sessionId = session.id;
            const payment = await Payment.findOne({
                where: { stripe_session_id: sessionId },
            });
            if (payment) {
                payment.status = "canceled";
                await payment.save();
            }
            break;
        }

        default:
            // ignore
            break;
    }
};

module.exports = {
    createSession,
    handleStripeEvent,
    verifyPaymentSession,
};
