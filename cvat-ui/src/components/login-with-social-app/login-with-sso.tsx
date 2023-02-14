// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'antd/lib/grid';
import Spin from 'antd/lib/spin';

import { selectIdPAsync, loadSocialAuthAsync } from 'actions/auth-actions';
import { CombinedState } from 'reducers';
import SigningLayout, { formSizes } from 'components/signing-common/signing-layout';
import { getCore, SocialAuthMethod, SelectionSchema } from 'cvat-core-wrapper';
import LoginWithSSOForm from './login-with-sso-form';

const core = getCore();

function LoginWithSSOComponent(): JSX.Element {
    const dispatch = useDispatch();
    const fetching = useSelector((state: CombinedState) => state.auth.ssoIDPSelectFetching);
    const isIdPSelected = useSelector((state: CombinedState) => state.auth.ssoIDPSelected);
    const selectedIdP = useSelector((state: CombinedState) => state.auth.ssoIDP);
    const [SSOConfiguration] = useSelector((state: CombinedState) => state.auth.socialAuthMethods.filter(
        (item: SocialAuthMethod) => item.provider === 'sso',
    ));

    useEffect(() => {
        dispatch(loadSocialAuthAsync());
    }, []);

    useEffect(() => {
        if (selectedIdP) {
            window.open(`${core.config.backendAPI}/auth/sso/${selectedIdP}/login/`, '_self');
        }
    }, [selectedIdP]);

    useEffect(() => {
        if (SSOConfiguration?.selectionSchema === SelectionSchema.L_WEIGHT) {
            dispatch(selectIdPAsync());
        }
    }, [SSOConfiguration?.selectionSchema]);

    if (
        (!fetching && !isIdPSelected && SSOConfiguration?.selectionSchema === SelectionSchema.EMAIL) ||
        (isIdPSelected && !selectedIdP)
    ) {
        return (
            <SigningLayout>
                <Col {...formSizes.wrapper}>
                    <Row justify='center'>
                        <Col {...formSizes.form}>
                            <LoginWithSSOForm
                                fetching={fetching}
                                onSubmit={(email: string): void => {
                                    dispatch(selectIdPAsync(email));
                                }}
                            />
                        </Col>
                    </Row>
                </Col>
            </SigningLayout>
        );
    }
    return (
        <div className='cvat-login-page cvat-spinner-container'>
            <Spin size='large' className='cvat-spinner' />
        </div>
    );
}

export default React.memo(LoginWithSSOComponent);