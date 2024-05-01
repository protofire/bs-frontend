import { Button, Grid, chakra, useUpdateEffect } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form';

import type { FormFields } from './types';
import type {
  SmartContractVerificationMethod,
  SmartContractVerificationError,
  SmartContractVerificationConfig,
  SmartContract,
} from 'types/api/contract';

import { route } from 'nextjs-routes';

import useApiFetch from 'lib/api/useApiFetch';
import delay from 'lib/delay';
import getErrorObjStatusCode from 'lib/errors/getErrorObjStatusCode';
import useShards from 'lib/hooks/useShards';
import useToast from 'lib/hooks/useToast';
import * as mixpanel from 'lib/mixpanel/index';

import ContractVerificationFieldAddress from './fields/ContractVerificationFieldAddress';
import ContractVerificationFieldLicenseType from './fields/ContractVerificationFieldLicenseType';
import ContractVerificationFieldMethod from './fields/ContractVerificationFieldMethod';
import ContractVerificationFlattenSourceCode from './methods/ContractVerificationFlattenSourceCode';
import ContractVerificationMultiPartFile from './methods/ContractVerificationMultiPartFile';
import ContractVerificationSourcify from './methods/ContractVerificationSourcify';
import ContractVerificationStandardInput from './methods/ContractVerificationStandardInput';
import ContractVerificationVyperContract from './methods/ContractVerificationVyperContract';
import ContractVerificationVyperMultiPartFile from './methods/ContractVerificationVyperMultiPartFile';
import ContractVerificationVyperStandardInput from './methods/ContractVerificationVyperStandardInput';
import { prepareRequestBody, formatSocketErrors, getDefaultValues, METHOD_LABELS } from './utils';

interface Props {
  method?: SmartContractVerificationMethod;
  config: SmartContractVerificationConfig;
  hash?: string;
}

const ContractVerificationForm = ({ method: methodFromQuery, config, hash }: Props) => {
  const formApi = useForm<FormFields>({
    mode: 'onBlur',
    defaultValues: methodFromQuery ? getDefaultValues(methodFromQuery, config, hash, null) : undefined,
  });
  const { control, handleSubmit, watch, formState, setError, reset } = formApi;
  const submitPromiseResolver = React.useRef<(value: unknown) => void>();
  const methodNameRef = React.useRef<string>();

  const apiFetch = useApiFetch();
  const { subscribeOnTopicMessage } = useShards();
  const toast = useToast();

  const onFormSubmit: SubmitHandler<FormFields> = React.useCallback(
    async(data) => {
      const body = prepareRequestBody(data);

      if (!hash) {
        try {
          const response = await apiFetch<'contract', SmartContract>('contract', {
            pathParams: { hash: data.address.toLowerCase() },
          });

          const isVerifiedContract =
            'is_verified' in response && response?.is_verified && !response.is_partially_verified;
          if (isVerifiedContract) {
            setError('address', { message: 'Contract has already been verified' });
            return Promise.resolve();
          }
        } catch (error) {
          const statusCode = getErrorObjStatusCode(error);
          const message = statusCode === 404 ? 'Address is not a smart contract' : 'Something went wrong';
          setError('address', { message });
          return Promise.resolve();
        }
      }

      try {
        await apiFetch('contract_verification_via', {
          pathParams: { method: data.method.value, hash: data.address.toLowerCase() },
          fetchParams: {
            method: 'POST',
            body,
          },
        });
      } catch (error) {
        return;
      }

      return new Promise((resolve) => {
        submitPromiseResolver.current = resolve;
      });
    },
    [ apiFetch, hash, setError ],
  );

  const address = watch('address');

  const methods = React.useMemo(() => {
    return {
      'flattened-code': <ContractVerificationFlattenSourceCode config={ config }/>,
      'standard-input': <ContractVerificationStandardInput config={ config }/>,
      sourcify: <ContractVerificationSourcify/>,
      'multi-part': <ContractVerificationMultiPartFile/>,
      'vyper-code': <ContractVerificationVyperContract config={ config }/>,
      'vyper-multi-part': <ContractVerificationVyperMultiPartFile/>,
      'vyper-standard-input': <ContractVerificationVyperStandardInput/>,
    };
  }, [ config ]);
  const method = watch('method');
  const licenseType = watch('license_type');
  const content = methods[method?.value] || null;
  const methodValue = method?.value;

  const handleNewVerificationMessage = React.useCallback(
    async(_shardId: string, message: unknown) => {
      const payload = message as { status: string; errors?: SmartContractVerificationError };

      if (payload.status === 'error' && payload.errors) {
        const errors = formatSocketErrors(payload?.errors);
        errors.filter(Boolean).forEach(([ field, error ]) => setError(field, error));
        await delay(100); // have to wait a little bit, otherwise isSubmitting status will not be updated
        submitPromiseResolver.current?.(null);
        return;
      }

      toast({
        position: 'top-right',
        title: 'Success',
        description: 'Contract is successfully verified.',
        status: 'success',
        variant: 'subtle',
        isClosable: true,
      });

      mixpanel.logEvent(
        mixpanel.EventTypes.CONTRACT_VERIFICATION,
        { Status: 'Finished', Method: methodNameRef.current || '' },
        { send_immediately: true },
      );

      window.location.assign(route({ pathname: '/address/[hash]', query: { hash: address, tab: 'contract' } }));
    },
    [ setError, toast, address ],
  );

  useEffect(() => {
    subscribeOnTopicMessage({
      channelTopic: `addresses:${ address?.toLowerCase() }`,
      event: 'verification_result',
      onMessage: handleNewVerificationMessage,
    });
  }, [ address, subscribeOnTopicMessage, handleNewVerificationMessage ]);

  useUpdateEffect(() => {
    if (methodValue) {
      reset(getDefaultValues(methodValue, config, hash || address, licenseType));

      const methodName = METHOD_LABELS[methodValue];
      mixpanel.logEvent(mixpanel.EventTypes.CONTRACT_VERIFICATION, { Status: 'Method selected', Method: methodName });
      methodNameRef.current = methodName;
    }
    // !!! should run only when method is changed
  }, [ methodValue ]);

  return (
    <FormProvider { ...formApi }>
      <chakra.form noValidate onSubmit={ handleSubmit(onFormSubmit) }>
        <Grid
          as="section"
          columnGap="30px"
          rowGap={{ base: 2, lg: 5 }}
          templateColumns={{ base: '1fr', lg: 'minmax(auto, 680px) minmax(0, 340px)' }}
        >
          { !hash && <ContractVerificationFieldAddress/> }
          <ContractVerificationFieldLicenseType/>
          <ContractVerificationFieldMethod
            control={ control }
            methods={ config.verification_options }
            isDisabled={ formState.isSubmitting }
          />
        </Grid>
        { content }
        { Boolean(method) && (
          <Button
            variant="solid"
            size="lg"
            type="submit"
            mt={ 12 }
            isLoading={ formState.isSubmitting }
            loadingText="Verify & publish"
          >
            Verify & publish
          </Button>
        ) }
      </chakra.form>
    </FormProvider>
  );
};

export default React.memo(ContractVerificationForm);
