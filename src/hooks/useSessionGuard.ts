import { CommonActions, useNavigation } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useAppDispatch } from "../redux/hooks";
import { logoutUser } from "../redux/slices/authSlice";
import { api } from "../services/api";

export function useSessionGuard() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const alertShown = useRef(false);

  const handleSessionExpired = async () => {
    if (alertShown.current) return;
    alertShown.current = true;

    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Token already gone — proceed anyway
    }

    Alert.alert(
      "Session Ended",
      "Your account was signed in on another device. You have been logged out here for your security.",
      [
        {
          text: "Sign In Again",
          onPress: () => {
            alertShown.current = false;
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Signin" }],
              })
            );
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    const responseInterceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const is401 = error.response?.status === 401;
        const isUnauthenticated =
          error.response?.data?.message === "Unauthenticated." ||
          error.response?.data?.message === "Unauthenticated";

        const isServerAuthError = is401 && isUnauthenticated;

        // getHeaders() threw before the request was sent — token missing locally
        const isLocalAuthError =
          !error.response &&
          (error?.message?.includes("No token found") ||
            error?.message?.includes("Unauthorized") ||
            error?.message?.includes("Session expired"));

        if (isServerAuthError || isLocalAuthError) {
          await handleSessionExpired();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptorId);
    };
  }, [navigation, dispatch]);
}