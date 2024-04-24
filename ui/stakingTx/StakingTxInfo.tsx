import {
  Box,
  Grid,
  GridItem,
  Text,
  Link,
  Flex,
  Skeleton,
} from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React from 'react';
import { scroller, Element } from 'react-scroll';

import type { StakingTransaction } from 'types/api/stakingTransaction';

import config from 'configs/app';
import useShards from 'lib/hooks/useShards';
import Tag from 'ui/shared/chakra/Tag';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import DetailsInfoItemDivider from 'ui/shared/DetailsInfoItemDivider';
import DetailsTimestamp from 'ui/shared/DetailsTimestamp';
import DetailWeiConverter from 'ui/shared/DetailWeiConverter';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import { Copy } from 'ui/shared/entities/base/components';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import HashStringShorten from 'ui/shared/HashStringShorten';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';
import StakingTxType from 'ui/shared/stakingTx/StakingTxType';
import TxStatus from 'ui/shared/statusTag/TxStatus';
import TextSeparator from 'ui/shared/TextSeparator';
import Utilization from 'ui/shared/Utilization/Utilization';
import TxDetailsGasPrice from 'ui/tx/details/TxDetailsGasPrice';

interface Props {
  data: StakingTransaction | undefined;
  isLoading: boolean;
}

const StakingTxInfo = ({ data, isLoading }: Props) => {
  const [ isExpanded, setIsExpanded ] = React.useState(false);

  const { shardId } = useShards();

  const handleCutClick = React.useCallback(() => {
    setIsExpanded((flag) => !flag);
    scroller.scrollTo('TxInfo__cutLink', {
      duration: 500,
      smooth: true,
    });
  }, []);

  if (!data) {
    return null;
  }

  const addressFromTags = [
    ...(data.from.private_tags || []),
    ...(data.from.public_tags || []),
    ...(data.from.watchlist_names || []),
  ].map((tag) => <Tag key={ tag.label }>{ tag.display_name }</Tag>);

  return (
    <Grid
      columnGap={ 8 }
      rowGap={{ base: 3, lg: 3 }}
      templateColumns={{
        base: 'minmax(0, 1fr)',
        lg: 'max-content minmax(728px, auto)',
      }}
    >
      <DetailsInfoItem
        title="Hash"
        hint="Unique character string (TxID) assigned to every verified transaction"
        flexWrap="nowrap"
        isLoading={ isLoading }
      >
        <Skeleton isLoaded={ !isLoading } overflow="hidden">
          <HashStringShortenDynamic hash={ data.hash }/>
        </Skeleton>
        <CopyToClipboard text={ data.hash } isLoading={ isLoading }/>

        { config.features.metasuites.isEnabled && (
          <>
            <TextSeparator
              color="gray.500"
              flexShrink={ 0 }
              display="none"
              id="meta-suites__tx-explorer-separator"
            />
            <Box
              display="none"
              flexShrink={ 0 }
              id="meta-suites__tx-explorer-link"
            />
          </>
        ) }
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Block"
        hint="Block number containing the transaction"
        isLoading={ isLoading }
      >
        { data.block === null ? (
          <Text>Pending</Text>
        ) : (
          <BlockEntity isLoading={ isLoading } number={ data.block } noIcon/>
        ) }
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Shard"
        hint="Shard number where the transaction was included"
        isLoading={ isLoading }
      >
        <Text>{ shardId ?? '0' }</Text>
      </DetailsInfoItem>
      { data.status && (
        <DetailsInfoItem
          title="Status"
          hint="Current transaction state"
          isLoading={ isLoading }
        >
          <TxStatus status={ data.status } isLoading={ isLoading }/>
        </DetailsInfoItem>
      ) }
      <DetailsInfoItem
        title="Type"
        hint="Type of staking transaction"
        isLoading={ isLoading }
      >
        <StakingTxType data={ data.type } isLoading={ isLoading }/>
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Nonce"
        hint="Nonce of the transaction"
        isLoading={ isLoading }
      >
        <Text>{ data.nonce }</Text>
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Index"
        hint="Transaction index"
        isLoading={ isLoading }
      >
        <Text>{ data.transaction_index }</Text>
      </DetailsInfoItem>
      { data.timestamp && (
        <DetailsInfoItem
          title="Timestamp"
          hint="Date & time of transaction inclusion, including length of time for confirmation"
          isLoading={ isLoading }
        >
          <DetailsTimestamp timestamp={ data.timestamp } isLoading={ isLoading }/>
        </DetailsInfoItem>
      ) }

      <DetailsInfoItemDivider/>

      <DetailsInfoItem
        title="From"
        hint="Address (external or contract) sending the transaction"
        isLoading={ isLoading }
        columnGap={ 3 }
      >
        <AddressEntity address={ data.from } isLoading={ isLoading }/>
        { data.from.name && <Text>{ data.from.name }</Text> }
        { addressFromTags.length > 0 && (
          <Flex columnGap={ 3 }>{ addressFromTags }</Flex>
        ) }
      </DetailsInfoItem>
      <DetailsInfoItemDivider/>

      <TxDetailsGasPrice gasPrice={ data.gas_price } isLoading={ isLoading }/>

      <DetailsInfoItem
        title="Gas usage & limit by txn"
        hint="Actual gas amount used by the transaction"
        isLoading={ isLoading }
      >
        <Skeleton isLoaded={ !isLoading }>{ BigNumber(data.gas_used || 0).toFormat() }</Skeleton>
        <TextSeparator/>
        <Skeleton isLoaded={ !isLoading }>{ BigNumber(data.gas || 0).toFormat() }</Skeleton>
        <Utilization ml={ 4 } value={ BigNumber(data.gas_used || 0).dividedBy(BigNumber(data.gas || 0)).toNumber() } isLoading={ isLoading }/>
      </DetailsInfoItem>

      <GridItem colSpan={{ base: undefined, lg: 2 }}>
        <Element name="TxInfo__cutLink">
          <Skeleton isLoaded={ !isLoading } mt={ 6 } display="inline-block">
            <Link
              display="inline-block"
              fontSize="sm"
              textDecorationLine="underline"
              textDecorationStyle="dashed"
              onClick={ handleCutClick }
            >
              { isExpanded ? 'Hide details' : 'View details' }
            </Link>
          </Skeleton>
        </Element>
      </GridItem>
      { isExpanded && (
        <>
          <GridItem
            colSpan={{ base: undefined, lg: 2 }}
            mt={{ base: 1, lg: 4 }}
          />

          { data.msg_validator_address && (
            <DetailsInfoItem
              title="Validator address"
              hint="Address of the validator"
              isLoading={ isLoading }
            >
              <AddressEntity
                address={{
                  hash: data.msg_validator_address,
                }}
                isLoading={ isLoading }
              />
            </DetailsInfoItem>
          ) }

          { data.msg_name && (
            <DetailsInfoItem
              title="Name"
              hint="Name of the validator"
              isLoading={ isLoading }
            >
              <Text>{ data.msg_name }</Text>
            </DetailsInfoItem>
          ) }

          { data.msg_commission_rate && (
            <DetailWeiConverter
              title="Commission rate"
              hint="Commission rate of the validator"
              value={ data.msg_commission_rate }
              isLoading={ isLoading }
            />
          ) }

          { data.msg_max_commission_rate && (
            <DetailWeiConverter
              title="Max commission rate"
              hint="Max commission rate of the validator"
              value={ data.msg_max_commission_rate }
              isLoading={ isLoading }
            />
          ) }

          { data.msg_max_change_rate && (
            <DetailWeiConverter
              title="Max change rate"
              hint="Max change rate of the validator"
              value={ data.msg_max_change_rate }
              isLoading={ isLoading }
            />
          ) }

          { data.msg_min_self_delegation && (
            <DetailWeiConverter
              title="Min self delegation"
              hint="Minimum self delegation of the validator"
              value={ data.msg_min_self_delegation }
              isLoading={ isLoading }
            />
          ) }

          { data.msg_max_total_delegation && (
            <DetailWeiConverter
              title="Max total delegation"
              hint="Maximum total delegation of the validator"
              value={ data.msg_max_total_delegation }
              isLoading={ isLoading }
            />
          ) }

          { data.msg_amount && (
            <DetailWeiConverter
              title="Amount"
              hint="Amount of the transaction"
              value={ data.msg_amount }
              isLoading={ isLoading }
            />
          ) }

          { data.msg_website && (
            <DetailsInfoItem
              title="Website"
              hint="Website of the validator"
              isLoading={ isLoading }
            >
              <Link href={ data.msg_website } target="_blank">
                { data.msg_website }
              </Link>
            </DetailsInfoItem>
          ) }

          { data.msg_identity && (
            <DetailsInfoItem
              title="Identity"
              hint="Identity of the validator"
              isLoading={ isLoading }
            >
              <Text>{ data.msg_identity }</Text>
            </DetailsInfoItem>
          ) }

          { data.msg_security_contact && (
            <DetailsInfoItem
              title="Security contact"
              hint="Security contact of the validator"
              isLoading={ isLoading }
            >
              <Text>{ data.msg_security_contact }</Text>
            </DetailsInfoItem>
          ) }

          { data.msg_details && (
            <DetailsInfoItem
              title="Details"
              hint="Details of the validator"
              isLoading={ isLoading }
            >
              <Text>{ data.msg_details }</Text>
            </DetailsInfoItem>
          ) }

          { data.msg_slot_pub_keys && data.msg_slot_pub_keys.length > 0 && (
            <DetailsInfoItem
              title="Slot public keys"
              hint="Slot public keys of the validator"
              isLoading={ isLoading }
            >
              <Flex direction="column" columnGap={ 3 }>
                { data.msg_slot_pub_keys.map((key) => (
                  <Flex
                    key={ key }
                  >
                    <HashStringShorten
                      hash={ key }
                      type="long"
                    />
                    <Copy text={ key }/>
                  </Flex>
                )) }
              </Flex>
            </DetailsInfoItem>
          ) }

          { data.msg_delegator_address && (
            <DetailsInfoItem
              title="Delegator address"
              hint="Address of the delegator"
              isLoading={ isLoading }
            >
              <AddressEntity
                address={{
                  hash: data.msg_delegator_address,
                }}
                isLoading={ isLoading }
              />
            </DetailsInfoItem>
          ) }

          { data.msg_slot_pub_key_to_add && (
            <DetailsInfoItem
              title="Slot public key to add"
              hint="Slot public key to add"
              isLoading={ isLoading }
            >
              <Text>{ data.msg_slot_pub_key_to_add }</Text>
            </DetailsInfoItem>
          ) }

          { data.msg_slot_pub_key_to_remove && (
            <DetailsInfoItem
              title="Slot public key to remove"
              hint="Slot public key to remove"
              isLoading={ isLoading }
            >
              <Text>{ data.msg_slot_pub_key_to_remove }</Text>
            </DetailsInfoItem>
          ) }
        </>
      ) }
    </Grid>
  );
};

export default StakingTxInfo;
