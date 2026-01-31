export type RootTabParamList = {
    Home: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Welcome: undefined;
    Signin: undefined;
    Signup: undefined;
    Airtime: undefined;
    Data: undefined;
    CableTv: undefined;
    Electricity: undefined;
    Referral: undefined;
    ProfileInfo: undefined;
    ChangePassword: undefined;
    Support: undefined;
    DeleteAccount: undefined;
    ForgotPassword: undefined;
    ForgotPasswordOtp: undefined;
    ResetPassword: {
        email: string;
        otp: string;
        token: string;
    };
    Verification: {
        email: string;
        name: string;
        otpType: string;
    };
    TransactionDetail: {
        transaction: any;
    };
    FundAmount: {
        method: 'bank' | 'card';
    };
    BankTransferDetails: {
        transferDetails: {
            account_number: string;
            account_status: string;
            amount: string;
            bank_name: string;
            created_at: string;
            expiry_date: string;
            flw_ref: string;
            frequency: number;
            note: string;
            order_ref: string;
            response_code: string;
            response_message: string;
        };
        amount: string;
    };
    WebViewPayment: {
        amount: string;
        user: {
            email?: string;
            phone?: string;
            name?: string;
        };
    };
    Notification: undefined;
    Tabs: undefined;
};
