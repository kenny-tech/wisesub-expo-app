
export const BASE_API = 'http://localhost:8000';

export const REGISTER = 'auth/register';
export const ACTIVATE_ACCOUNT = 'auth/activate_account';
export const VERIFY_OTP = 'auth/verify_otp';
export const RESET_PASSWORD = 'auth/reset_password';
export const LOGIN = 'auth/login';
export const FORGOT_PASSWORD = 'auth/forgot_password';
export const RESEND_OTP = 'auth/resend_otp';

export const SET_PIN = 'user/set_pin';
export const CHANGE_PASSWORD = 'user/change_password';
export const CHANGE_PIN = 'user/change_pin';
export const UPDATE_PROFILE = 'user/update_profile';
export const GET_PROFILE = 'user/profile';
export const LOG_OUT = 'user/logout';
export const DELETE_ACCOUNT = 'user/delete-account';

export const CREATE_PAYMENT = 'user/payment/create';
export const CREATE_FAILED_PAYMENT = 'user/payment/save_failed_payment';

export const GET_WALLET_BALANCE = 'user/wallet/get_balance';
export const GET_WALLET_TRANSACTIONS = 'user/wallet/get_user_transactions';
export const PAY_BILL = 'user/wallet/pay_bill';

export const GET_TRANSACTIONS = 'user/transaction/get_user_transactions';
export const GET_TRANSACTION_TOTALS = 'user/transaction/sum_user_transaction_by_type';

export const GET_PROVIDER_PLANS = 'user/get_bill_by_category';

export const GET_ITEMS = 'user/item/get';

export const VALIDATE_CUSTOMER = 'user/validate_customer';

export const BENEFICIARIES = 'user/beneficiary/get';
export const SAVE_BENEFICIARY = 'user/beneficiary/add';

export const SAVE_FCM_TOKEN = 'user/create_fcm_token';

export const GENERATE_VIRTUAL_ACCOUNT = 'user/virtual_account_number';

export const LATEST_APP_VERSION = 'latest-app-version';

export const GET_NOTIFICATION = 'user/get-notification';
export const READ_NOTIFICATION = 'user/read-notification';







