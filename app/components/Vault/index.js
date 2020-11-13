import React, { useContext, memo } from 'react';
import { compose } from 'redux';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import Card from 'react-bootstrap/Card';
import ColumnList from 'components/Vault/columns';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { purple } from '@material-ui/core/colors';
import Arrow from 'images/arrow.svg';
import ColumnListDev from 'components/Vault/columnsDev';
import BigNumber from 'bignumber.js';
import { abbreviateNumber } from 'utils/string';
import { selectDevMode } from 'containers/DevMode/selectors';
import { selectContract } from 'containers/App/selectors';
import { getContractType } from 'utils/contracts';

const IconAndName = styled.div`
  display: grid;
  grid-template-columns: 60px calc(100% - 60px);
  align-items: center;
`;

const Icon = styled.img`
  width: 40px;
  margin-right: 20px;
  margin-top: 10px;
`;

const IconName = styled.div`
  overflow: hidden;
  padding-right: 10px;
  text-overflow: ellipsis;
  margin-top: 8px;
`;

const StyledArrow = styled.img`
  margin-right: 30px;
  transform: ${props => (props.expanded ? 'rotate(0)' : 'rotate(-180deg)')};
  transition: transform 0.1s linear;
`;

const A = styled.a`
  display: ilflex;
`;

const Td = styled.td`
  &:not(:first-of-type) {
    padding-left: 20px;
  }
`;

const Table = styled.table`
  font-size: 20px;
  margin-left: 40px;
  margin-top: 10px;
  margin-bottom: 20px;
  font-family: monospace;
`;

const truncateApy = apy => {
  if (!apy) {
    return 'N/A';
  }
  const truncatedApy = apy && apy.toFixed(2);
  const apyStr = `${truncatedApy}%`;
  return apyStr;
};

const ColorButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText(purple[500]),
    fontFamily: 'Calibre Medium',
    fontSize: '20px',
    padding: '8px 40px 5px 40px',
    margin: '20px',
    marginLeft: '0px',
    textTransform: 'inherit',
    backgroundColor: '#0657F9',
    '&:hover': {
      backgroundColor: '#0657F9',
    },
  },
}))(Button);

const LinkWrap = props => {
  const { devMode, children, address } = props;
  if (!devMode) {
    return children;
  }
  return (
    <A
      href={`https://etherscan.io/address/${address}`}
      target="_blank"
      onClick={evt => evt.stopPropagation()}
    >
      {children}
    </A>
  );
};

const Vault = props => {
  const { vault, showAllFields } = props;
  const {
    symbolAlias,
    vaultIcon,
    tokenIcon,
    tokenAddress,
    tokenSymbolAlias,
    decimals,
    token,
    name,
    totalAssets,
    balance,
    balanceOf,
    address,
  } = vault;

  console.log('rend');

  const devMode = useSelector(selectDevMode());
  const tokenContract = useSelector(
    selectContract('tokens', tokenAddress || token),
  );
  const tokenBalance = _.get(tokenContract, 'balanceOf');
  const tokenSymbol = tokenSymbolAlias || _.get(tokenContract, 'symbol');
  const vaultName = symbolAlias || tokenSymbol || name;
  const accordionEventKey = address;
  const currentEventKey = useContext(AccordionContext);
  const active = currentEventKey === accordionEventKey;
  // const active = false;
  const apyOneMonthSample = _.get(vault, 'apy.apyOneMonthSample');
  const apy = truncateApy(apyOneMonthSample);
  const tokenBalanceOf = new BigNumber(tokenBalance)
    .dividedBy(10 ** decimals)
    .toFixed();
  const vaultBalanceOf = new BigNumber(balanceOf)
    .dividedBy(10 ** decimals)
    .toFixed();
  let vaultAssets = balance || totalAssets;
  vaultAssets = new BigNumber(vaultAssets).dividedBy(10 ** decimals).toFixed(0);
  vaultAssets = vaultAssets === 'NaN' ? '-' : abbreviateNumber(vaultAssets);
  const contractType = getContractType(vault);

  let vaultBottom;
  let vaultTop;
  if (showAllFields) {
    const renderField = (val, key) => {
      let newVal = _.toString(val);
      const valIsAddress = /0[xX][0-9a-fA-F]{40}/.test(newVal);
      const valIsNumber = /^[0-9]*$/.test(newVal);
      if (valIsAddress) {
        newVal = (
          <A href={`https://etherscan.io/address/${address}`} target="_blank">
            {address}
          </A>
        );
      } else if (valIsNumber) {
        newVal = (
          <AnimatedNumber value={newVal} formatter={v => v.toFixed(0)} />
        );
      }
      return (
        <tr key={key}>
          <Td>{key}</Td>
          <Td>{newVal}</Td>
        </tr>
      );
    };

    const vaultWithoutMetadata = _.omit(vault, 'metadata');
    const fields = _.map(vaultWithoutMetadata, renderField);
    vaultBottom = (
      <Table>
        <tbody>{fields}</tbody>
      </Table>
    );
    vaultTop = (
      <ColumnListDev>
        <IconAndName>
          <LinkWrap devMode={devMode} address={address}>
            <Icon src={vaultIcon || tokenIcon} />
          </LinkWrap>
          <LinkWrap devMode={devMode} address={address}>
            <IconName devMode={devMode}>{vaultName}</IconName>
          </LinkWrap>
        </IconAndName>
        <div>{contractType}</div>
        <div>
          <AnimatedNumber value={vaultBalanceOf} />
        </div>
        <div>{vaultAssets}</div>
        <div>
          <AnimatedNumber value={tokenBalanceOf} />{' '}
          <LinkWrap devMode={devMode} address={tokenAddress}>
            {tokenSymbol}
          </LinkWrap>
        </div>
      </ColumnListDev>
    );
  } else {
    vaultBottom = <React.Fragment>cruft</React.Fragment>;
    vaultTop = (
      <ColumnList>
        <IconAndName>
          <LinkWrap devMode={devMode} address={address}>
            <Icon src={vaultIcon || tokenIcon} />
          </LinkWrap>
          <LinkWrap devMode={devMode} address={address}>
            <IconName devMode={devMode}>{vaultName}</IconName>
          </LinkWrap>
        </IconAndName>
        <div>
          <AnimatedNumber value={vaultBalanceOf} />
        </div>
        <div>{vaultAssets}</div>
        <div>{apy}</div>
        <div>
          <AnimatedNumber value={tokenBalanceOf} />{' '}
          <LinkWrap devMode={devMode} address={tokenAddress}>
            {tokenSymbol}
          </LinkWrap>
        </div>
      </ColumnList>
    );
  }
  return (
    <React.Fragment>
      <Card className={active && 'active'}>
        <Accordion.Toggle
          as={Card.Header}
          variant="link"
          eventKey={accordionEventKey}
        >
          {vaultTop}
          <StyledArrow src={Arrow} alt="arrow" expanded={active} />
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={accordionEventKey}>
          <Card.Body>
            {vaultBottom}
            <Card.Footer className={active && 'active'}>
              <ColorButton variant="contained" color="primary">
                Deposit
              </ColorButton>
              <ColorButton variant="contained" color="primary">
                Withdraw
              </ColorButton>
            </Card.Footer>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
};
Vault.whyDidYouRender = true;
export default compose(memo)(Vault);
