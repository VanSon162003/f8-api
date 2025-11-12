#!/bin/bash
# Sepay Testing Helper Script
# Usage: bash sepay-test-helper.sh [command]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database credentials
DB_USER="root"
DB_NAME="f8_dev"
DB_HOST="127.0.0.1"

echo -e "${BLUE}🧪 SEPAY TESTING HELPER${NC}\n"

# Function to print headers
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Function: Test Backend
test_backend() {
    print_header "Testing Backend Connectivity"
    
    if curl -s http://localhost:3000/api/courses > /dev/null; then
        echo -e "${GREEN}✅ Backend running on http://localhost:3000${NC}"
    else
        echo -e "${RED}❌ Backend not responding${NC}"
        echo "Start backend with: cd f8-api && npm start"
        exit 1
    fi
}

# Function: Check Database
check_database() {
    print_header "Checking Database Connection"
    
    mysql -u $DB_USER $DB_NAME -e "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database connected${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        exit 1
    fi
}

# Function: Show Test Users
show_users() {
    print_header "Available Test Users"
    
    mysql -u $DB_USER $DB_NAME -e "SELECT id, email, name FROM users LIMIT 5;" | column -t
}

# Function: Show Pro Courses
show_pro_courses() {
    print_header "Available Pro Courses for Testing"
    
    mysql -u $DB_USER $DB_NAME -e "
        SELECT id, title, price, slug, is_pro 
        FROM courses 
        WHERE is_pro = 1 
        LIMIT 5;
    " | column -t
}

# Function: Show Recent Payments
show_payments() {
    print_header "Recent Payment Records"
    
    mysql -u $DB_USER $DB_NAME -e "
        SELECT 
            id,
            user_id,
            course_id,
            amount,
            status,
            payment_method,
            reference_code,
            created_at
        FROM payments 
        ORDER BY created_at DESC 
        LIMIT 5;
    " | column -t
}

# Function: Mark Payment as Completed
complete_payment() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Please provide payment ID${NC}"
        echo "Usage: bash sepay-test-helper.sh complete <payment_id>"
        exit 1
    fi
    
    print_header "Marking Payment as Completed"
    
    PAYMENT_ID=$1
    
    # Check if payment exists
    RESULT=$(mysql -u $DB_USER $DB_NAME -se "SELECT id FROM payments WHERE id = $PAYMENT_ID;")
    
    if [ -z "$RESULT" ]; then
        echo -e "${RED}❌ Payment ID $PAYMENT_ID not found${NC}"
        exit 1
    fi
    
    # Update payment status
    mysql -u $DB_USER $DB_NAME -e "
        UPDATE payments 
        SET status = 'completed', 
            sepay_transaction_id = 'TEST_TXN_$PAYMENT_ID'
        WHERE id = $PAYMENT_ID;
    "
    
    # Show the updated record
    echo -e "${GREEN}✅ Payment $PAYMENT_ID marked as completed${NC}\n"
    mysql -u $DB_USER $DB_NAME -e "
        SELECT id, user_id, course_id, status, reference_code, created_at 
        FROM payments 
        WHERE id = $PAYMENT_ID;
    " | column -t
}

# Function: Clean Up Test Data
cleanup() {
    print_header "Cleaning Up Test Data"
    
    read -p "Enter user ID to clean (or press Enter to skip): " USER_ID
    
    if [ ! -z "$USER_ID" ]; then
        mysql -u $DB_USER $DB_NAME -e "
            DELETE FROM user_courses 
            WHERE user_id = $USER_ID 
            AND course_id IN (SELECT course_id FROM payments WHERE user_id = $USER_ID);
        "
        
        mysql -u $DB_USER $DB_NAME -e "
            DELETE FROM payments 
            WHERE user_id = $USER_ID;
        "
        
        echo -e "${GREEN}✅ Cleaned up test data for user $USER_ID${NC}"
    fi
}

# Function: Run All Pre-Tests
run_pretests() {
    print_header "Running Pre-Test Checks"
    
    test_backend
    check_database
    
    echo -e "\n${GREEN}✅ All pre-tests passed!${NC}"
    echo -e "${YELLOW}You're ready to start testing.${NC}\n"
}

# Function: API Test
api_test() {
    print_header "Testing API Endpoints"
    
    echo -e "${YELLOW}Test 1: GET /api/courses${NC}"
    curl -s http://localhost:3000/api/courses | jq . | head -20
    
    echo -e "\n${YELLOW}Test 2: Check if migration applied${NC}"
    mysql -u $DB_USER $DB_NAME -e "
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'payments' 
        AND COLUMN_NAME IN ('reference_code', 'qr_code', 'payment_method', 'sepay_transaction_id')
        ORDER BY COLUMN_NAME;
    " | column -t
}

# Function: Show Help
show_help() {
    cat << EOF
${GREEN}SEPAY Testing Helper - Commands:${NC}

  bash sepay-test-helper.sh [command]

${YELLOW}Commands:${NC}
  pretest              Run all pre-test checks (backend, database)
  users                Show available test users
  courses              Show available pro courses
  payments             Show recent payment records
  complete <id>        Mark payment ID as completed (simulate success)
  cleanup              Delete test payment data
  api-test             Test API endpoints
  help                 Show this help message

${YELLOW}Examples:${NC}
  bash sepay-test-helper.sh pretest
  bash sepay-test-helper.sh courses
  bash sepay-test-helper.sh complete 1
  bash sepay-test-helper.sh payments

EOF
}

# Main switch
case "${1:-help}" in
    pretest)
        run_pretests
        ;;
    users)
        show_users
        ;;
    courses)
        show_pro_courses
        ;;
    payments)
        show_payments
        ;;
    complete)
        complete_payment "$2"
        ;;
    cleanup)
        cleanup
        ;;
    api-test)
        api_test
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
