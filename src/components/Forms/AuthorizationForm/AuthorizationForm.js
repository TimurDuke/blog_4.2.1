import React, {useEffect, useState} from 'react';
import {CardContent} from "@mui/material";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import LoginIcon from '@mui/icons-material/Login';
import {Link} from "react-router-dom";
import {useForm, Controller} from "react-hook-form";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {
    AccountCheckBlock,
    TermsDiv,
    TermsDivInner,
    InputCheckbox,
    TermsText,
} from './AuthorizationFormStyles';
import {
    FormCardSm,
    FormTitle,
    InputLabel,
    Input,
    SubmitButton,
    FormError,
} from "../FormStyles";
import {loginPath, registerPath} from "../../../routes/routePaths";
import {clearError} from "../../../store/actions/notificationActions";
import {getRepeatPasswordRules} from "../../../utils/inputRuleUtils";

const AuthorizationForm = ({isRegister, fieldConfig, submitHandler, isLoading, error}) => {
    const [generalError, setGeneralError] = useState('');
    const dispatch = useDispatch();

    const notificationError = useSelector(state => state.notification.error);

    const {
        register,
        handleSubmit ,
        control,
        setError,
        clearErrors,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            ...fieldConfig.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}),
            isAgree: false,
        }
    });

    useEffect(() => () => dispatch(clearError()), [dispatch]);

    useEffect(() => {
        if (error && error.errors) {
            // Handle login errors
            if ("email or password" in error.errors) {
                setError("email", { type: "server" });
                setError("password", { type: "server" });

                setGeneralError("Email or password is invalid");
            }
        }
    }, [error, setError]);

    const formSubmitHandler = data => {
        if (generalError) {
            setGeneralError("");
            clearErrors(["email", "password"]);
        }

        dispatch(clearError());

        submitHandler(data);
    };

    if (isRegister) {
        fieldConfig.find(field => field.name === 'repeatPassword').rules = getRepeatPasswordRules(watch);
    }

    return (
        <FormCardSm>
            <CardContent sx={{padding: '24px'}}>
                <FormTitle variant="h5">
                    {isRegister ? 'Create new account' : 'Sign In'}
                </FormTitle>
                <form onSubmit={handleSubmit(formSubmitHandler)}>
                    {fieldConfig.map(({ name, label, rules, type }) => (
                        <label key={name} htmlFor={name}>
                            <InputLabel>
                                {label}
                            </InputLabel>
                            <Controller
                                name={name}
                                control={control}
                                rules={rules}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder={label}
                                        fullWidth
                                        type={type || 'text'}
                                        hiddenLabel
                                        id={name}
                                        error={!!errors[name] || !!notificationError[name]}
                                        helperText={errors[name]?.message || notificationError[name]}
                                        FormHelperTextProps={{
                                            sx: { margin: '4px 0 0' }
                                        }}
                                        size='small'
                                    />
                                )}
                            />
                        </label>
                    ))}
                    {generalError && <FormError>{generalError}</FormError>}
                    {isRegister &&
                        <TermsDiv>
                            <TermsDivInner>
                                <InputCheckbox
                                    {
                                        ...register(
                                            "isAgree",
                                            {required: "You must agree to the terms and conditions."}
                                        )
                                    }
                                    type="checkbox"
                                />
                                <TermsText>
                                    I agree to the processing of my personal
                                    information
                                </TermsText>
                            </TermsDivInner>
                            {errors.isAgree && <FormError>{errors.isAgree.message}</FormError>}
                        </TermsDiv>
                    }
                    <SubmitButton
                        fullWidth
                        size="medium"
                        loading={isLoading}
                        loadingPosition="end"
                        variant="contained"
                        endIcon={isRegister ? <AppRegistrationIcon/> : <LoginIcon/>}
                        type="submit"
                    >
                        <span>{isRegister ? 'Create' : 'Login'}</span>
                    </SubmitButton>
                    <AccountCheckBlock fontSize="14px">
                        {isRegister ? 'Already have an account?' : 'Don’t have an account?'}
                        {isRegister ?
                            <Link to={loginPath} style={{color: '#1890ff', textDecoration: 'none', marginLeft: '6px'}}>
                                Sign In
                            </Link> :
                            <Link to={registerPath} style={{color: '#1890ff', textDecoration: 'none', marginLeft: '6px'}}>
                                Sign Up
                            </Link>
                        }
                    </AccountCheckBlock>
                </form>
            </CardContent>
        </FormCardSm>
    );
}

export default AuthorizationForm;

AuthorizationForm.propTypes = {
    isRegister: PropTypes.bool.isRequired,
    submitHandler: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    fieldConfig: PropTypes.arrayOf(PropTypes.object).isRequired,
};
