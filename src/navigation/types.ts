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
    FundAmount: undefined;
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
    Tabs: undefined;
};
