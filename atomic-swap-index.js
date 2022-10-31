import React, { useState, useEffect } from 'react';
import AtomicExchange from '@components/icons/AtomicExchange';
import StandardFieldInput from '@components/fields/StandardFieldInput';
import { Field, useForm } from 'react-final-form';
import { Exchange, TokenType } from '@components/icons';
import { Button, Dropdown, Table } from '@components';
import { bool, func, object } from 'prop-types';
import { EMPTY_OBJECT } from '@constants';
import ReactDateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import Router from 'next/router';
import AtomicSwapTransaction from '@components/ui/AtomicSwapTransaction';
import styles from './styles.module.scss';
import getAtomicExchangeAddColumns from './atomicExchangeCreateHelper';

export default function AtomicExchangeCreateForm(props) {
  const {
    zeconomyUser,
    values,
    getTokenIssuanceList,
    searchCompanies,
    getPortfolio,
    getNextTransactionNo,
    saveAsDraft,
    getTokenIssuance,
    initialValues,
    saveAsDraftUpdate,
    submitSucceeded,
    atomicExchangeReject,
    setModalProps,
    addSnackBarItem,
    getBlockchainAccounts,
    requestAnOffer,
  } = props;
  const {
    company_tokens,
    id: atomic_exchange_id,
    counterparty_tokens,
    status,
    counterparty,
  } = initialValues;
  const { name: counterPartyCompanyName = '', id: counterCompanyPartyId } =
    counterparty || {};
  const { name: companyName, id: companyId } = zeconomyUser?.companies[0];
  const detailPage = status === 'Offer Requested';
  const form = useForm();
  const [tokenList, setTokenList] = useState([]);
  const [counterPartyTokenList, setCounterPartyTokenList] = useState([]);
  const [counterPartyIssuanceList, setCounterPartyIssuanceList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [addedCompanyList, setAddedCompanyList] = useState([]);
  const [addedCounterCompanyList, setAddedCounterCompanyList] = useState([]);
  const tokenTypes = [
    { value: 'ta_token', label: 'TA Tokens' },
    { value: 'cp_token', label: 'CP Tokens' },
  ];
  const [addTokenToggle, setAddTokenToggle] = useState(false);
  const [addTokenCounterToggle, setAddTokenCounterToggle] = useState(false);
  const [counterPartyId, setCounterPartyId] = useState(counterCompanyPartyId);
  const [nextAtomicExchange, setNextAtomicExchange] = useState();
  const [blockChainAddress, setBlockChainAddress] = useState('');
  // const [companyPortfolioList, setCompanyPortfolioList] = useState([]);

  const getBlockChainAddress = async (opCompanyId) => {
    if (typeof getBlockchainAccounts === 'function') {
      const counterPartyBCAddress = await getBlockchainAccounts({
        company_id: opCompanyId,
      });
      const { data = [] } = counterPartyBCAddress?.response || {};
      if (data.length) {
        const defaultBlockChain = data.find((x) => x.is_default);
        if (defaultBlockChain) {
          console.log('defaultBlockChain.address', defaultBlockChain.address);
          setBlockChainAddress(defaultBlockChain.address);
        }
      }
    }
  };

  useEffect(async () => {
    if (!companyList.length) {
      const resp = await searchCompanies({ company_function: 'token_issuing' });
      const { data = [] } = resp?.response;
      let list = data.map((x) => ({ label: x.name, value: x.id }));
      list = list.filter((x) => x.value !== zeconomyUser?.companies[0].id);
      setCompanyList(list);
    }
    if (counterCompanyPartyId) {
      getBlockChainAddress(counterCompanyPartyId);
    }
    if (initialValues.company_id && typeof getPortfolio === 'function') {
      const portfolio = await getPortfolio({
        company_id: initialValues.company_id,
        status: 'issued',
      });
      const portfolioResp = portfolio?.response?.data || [];
      if (
        company_tokens.length &&
        portfolioResp.length &&
        typeof getTokenIssuance === 'function'
      ) {
        const idArray = company_tokens.map((x) => x.issuance_id);
        const promiseArr = idArray.map((ztoken_id) =>
          getTokenIssuance({ ztoken_id })
        );
        const resp = await Promise.all(promiseArr);
        const prePopulateCompanyData = resp.map((obj, idx) => ({
          token_type: obj?.response?.token_type,
          token_Issuance: obj?.response?.issuance_no,
          ...company_tokens[idx],
        }));
        setAddedCompanyList(prePopulateCompanyData);
        // const companyListData = portfolioResp.filter((obj) => idArray.includes(obj.id));
        // const companyTokensWithIssuanceData = companyListData.map((cl) => {
        // 				const issueanceData = company_tokens.find(
        // 	(company) => company.issuance_id === cl.id,
        // 	)
        // 	|| {};
        // return {
        // 	...cl,
        // 	...issueanceData,
        // };
        // });
        // const companyTokenTables = companyTokensWithIssuanceData.filter(
        // 	(obj) => obj.mint_tx_hash,
        // );
        // setAddedCompanyList(companyTokenTables);
        // setCompanyPortfolioList(companyTokensWithIssuanceData);
        // if (companyTokensWithIssuanceData[0]) {
        // 	setTokenList([{
        // 		label: companyTokensWithIssuanceData[0]?.issuance_no,
        // 		value: companyTokensWithIssuanceData[0]?.issuance_no,
        // 	}]);
        // 	form.change('quantity', companyTokensWithIssuanceData[0]?.quantity);
        // 	form.change('issuance_no', companyTokensWithIssuanceData[0]?.issuance_no);
        // 	form.change('mint_tx_hash', companyTokensWithIssuanceData[0]?.mint_tx_hash);
        // 	form.change('token_type', companyTokensWithIssuanceData[0]?.token_type);
        // }
      }
      if (counterparty_tokens.length && typeof getPortfolio === 'function') {
        const cpIdArray = counterparty_tokens.map((x) => x.issuance_id);
        const portfolioCounterParty = await getPortfolio({
          company_id: initialValues.counterparty_id,
          status: 'issued',
        });
        const { data = [] } = portfolioCounterParty?.response;
        const filteredCounterParty = data.filter((x) =>
          cpIdArray.includes(x.id)
        );
        const prePopulateCounterCompData = filteredCounterParty.map(
          (obj, idx) => ({
            token_type: obj?.token_type,
            token_Issuance: obj?.issuance_no,
            ...counterparty_tokens[idx],
          })
        );
        setAddedCounterCompanyList(prePopulateCounterCompData);
      }
    }
    if (typeof getNextTransactionNo === 'function' && !nextAtomicExchange) {
      const nextAtomicExchangeNumber = await getNextTransactionNo();
      setNextAtomicExchange(nextAtomicExchangeNumber?.response?.transaction_no);
    } else {
      setNextAtomicExchange(initialValues.transaction_no);
    }
  }, []);

  useEffect(() => {
    // console.log()
  }, [submitSucceeded]);

  useEffect(async () => {
    if (values?.token_type) {
      const obj = await getTokenIssuanceList({
        desc: 'issuance_no',
        token_type: values.token_type,
        status: 'Issued',
      });
      const { data = [] } = obj.response;
      let dropdown = data.map((issue) => ({
        label: issue.issuance_no,
        value: issue.id,
      }));
      const selectedTokenListIds = addedCompanyList.map((x) =>
        Number(x.issuance_no)
      );
      dropdown = dropdown.filter(
        (x) => !selectedTokenListIds.includes(x.value)
      );
      setTokenList(dropdown);
    }
    if (values.token_type === 'ta_token') {
      form.change('quantity', 1);
    }
  }, [values.token_type]);

  useEffect(() => {
    if (values.token_type_op === 'ta_token') {
      form.change('quantity_op', 1);
    }
    if (values.token_type_op && counterPartyIssuanceList.length) {
      let listByType = counterPartyIssuanceList.filter(
        (x) => x.token_type === values.token_type_op
      );
      listByType = listByType.map((x) => ({
        label: x.issuance_no,
        value: x.id,
      }));
      if (addedCounterCompanyList.length) {
        const counterPartyIdArr = addedCounterCompanyList.map(
          (x) => x.issuance_id
        );
        listByType = listByType.filter(
          (x) => !counterPartyIdArr.includes(x.value)
        );
      }
      console.log('listByType', listByType, addedCounterCompanyList);
      setCounterPartyTokenList(listByType);
    }
  }, [values.token_type_op]);

  useEffect(async () => {
    if (typeof getPortfolio === 'function') {
      const obj = await getPortfolio({
        company_id: values.counterparty_id,
        status: 'issued',
      });
      const { data = [] } = obj.response;
      setCounterPartyTokenList(data);
      setCounterPartyIssuanceList(data);
    }
    if (values.counterparty_id)
      setCounterPartyId(Number(values.counterparty_id));
    // const issuanceListResp = await getTokenIssuanceList({
    // 	desc: 'issuance_no', token_type: values.token_type_op, status: 'Issued',
    // });
    // let { data: dataList = [] } = issuanceListResp.response;
    // dataList = dataList.map(
    // 	(dataObj) => ({ label: dataObj.issuance_no, value: dataObj.issuance_no }),
    // );
    if (values.counterparty_id) {
      getBlockChainAddress(values.counterparty_id);
    }
    setAddedCounterCompanyList([]);
  }, [values.counterparty_id]);

  const onExpirationDateChange = (value) => {
    form.change('expiration_date', new Date(value).toISOString());
  };

  const handleAddValidate = () => {
    if (
      values.token_type &&
      values.token_type === 'ta_token' &&
      values.mint_tx_hash &&
      values.issuance_no &&
      values.quantity
    ) {
      return false;
    }
    if (
      values.token_type &&
      values.token_type === 'cp_token' &&
      values.issuance_no &&
      values.quantity
    ) {
      return false;
    }
    return true;
  };

  const handleCounterValidate = () => {
    if (
      values.token_type_op &&
      values.token_type_op === 'ta_token' &&
      values.mint_tx_hash_op &&
      values.issuance_no_op &&
      values.quantity_op
    ) {
      return false;
    }
    if (
      values.token_type_op &&
      values.token_type_op === 'cp_token' &&
      values.issuance_no_op &&
      values.quantity_op
    ) {
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    Router.push('/tokens/atomic_exchange');
  };

  const saveDraft = async () => {
    const companyValues = addedCompanyList.map((x) => ({
      quantity: x.quantity,
      issuance_id: Number(x.issuance_no || x.issuance_id),
    }));
    const counterpartyValues = addedCounterCompanyList.map((x) => ({
      quantity: x.quantity,
      issuance_id: Number(x.issuance_no || x.issuance_id),
    }));
    const payload = {
      company_tokens: companyValues,
      company_id: companyId,
      counterparty_tokens: counterpartyValues,
      counterparty_id: counterPartyId,
      expiration_date: values.expiration_date || null,
      transaction_no: nextAtomicExchange,
    };
    if (typeof saveAsDraftUpdate === 'function' && atomic_exchange_id) {
      payload.id = atomic_exchange_id;
      await saveAsDraftUpdate(payload);
    } else {
      await saveAsDraft(payload);
    }
    handleCancel();
  };

  const handleAddCompany = () => {
    setAddTokenToggle(false);
    let arr = addedCompanyList;
    const selectedToken = tokenList.find(
      (x) => x.value === Number(values.issuance_no)
    );
    if (addedCompanyList.length) {
      arr.push({ ...values, token_Issuance: selectedToken.label });
    } else {
      arr = [{ ...values, token_Issuance: selectedToken.label }];
    }
    setAddedCompanyList(arr);
    setTimeout(() => {
      form.reset();
    });
  };

  const counterPartyAdd = () => {
    let arr = addedCounterCompanyList;
    setAddTokenCounterToggle(false);
    const selectedToken = counterPartyTokenList.find(
      (x) => x.value === Number(values.issuance_no_op)
    );
    if (addedCounterCompanyList.length) {
      arr.push({
        ...values,
        token_Issuance: selectedToken.label,
        issuance_id: Number(values.issuance_no_op),
        quantity: values.quantity_op,
      });
    } else {
      arr = [
        {
          ...values,
          token_Issuance: selectedToken.label,
          quantity: values.quantity_op,
          issuance_id: Number(values.issuance_no_op),
        },
      ];
    }
    setAddedCounterCompanyList(arr);
    setTimeout(() => {
      form.change('counterparty_tokens', arr);
      form.change('issuance_no_op', '');
      form.change('quantity_op', '');
      form.change('token_type_op', '');
    });
  };

  return (
    <div className={styles.mainContainer}>
      <div>
        {initialValues.transaction_no && (
          <div className={styles.transactionHeader}>
            Transaction #<b>{initialValues.transaction_no}</b>
          </div>
        )}
        <div className={styles.headerLabel}>
          <div className={styles.iconSection}>
            <h3>Atomic Exchange</h3>
            <small>
              Add tokens and propose an exchange with your counterparty.
            </small>
          </div>
          <AtomicExchange size={180} />
        </div>
        <div className={styles.cardSection}>
          <div className={styles.cardLeft}>
            {detailPage && (
              <>
                <div className={styles.requestHeader}>
                  You request an offer for:
                </div>
                {status === 'Offer Requested' &&
                  addedCompanyList.length &&
                  addedCompanyList.map((obj) => (
                    <div className={styles.seeDetails}>
                      <TokenType />
                      <div
                        style={{
                          alignSelf: 'center',
                          color: '#4996e6',
                          fontWeight: 'bold',
                        }}
                      >
                        {obj.token_type === 'cp_token' ? 'CP' : 'TA'}
                        Token # {obj.token_Issuance}
                      </div>
                      <div style={{ alignSelf: 'center' }}>
                        Quantity {obj.quantity}
                      </div>
                      <Button className={styles.seeDetailsbtn}>
                        See Details
                      </Button>
                    </div>
                  ))}
              </>
            )}
            {!detailPage ? (
              <>
                <div className={styles.companySection}>
                  <h4>{companyName}</h4>
                  <small>Please add tokens to swap.</small>
                </div>
                {addedCompanyList.length ? (
                  <div className={styles.listTable}>
                    <Table
                      columns={getAtomicExchangeAddColumns(
                        props,
                        addedCompanyList,
                        setAddedCompanyList
                      )}
                      data={addedCompanyList}
                      bottumBar={false}
                    />
                  </div>
                ) : null}
                {addedCompanyList.length && !addTokenToggle ? (
                  <Button
                    theme="cancel"
                    onClick={() => {
                      setAddTokenToggle(true);
                    }}
                  >
                    + Add Token
                  </Button>
                ) : null}
                {(addTokenToggle || !addedCompanyList.length) && (
                  <div className={styles.formFields}>
                    <div className={styles.fieldSet}>
                      <table>
                        <StandardFieldInput
                          component={Dropdown}
                          options={tokenTypes}
                          label="Token Type"
                          name="token_type"
                          required
                        />
                        <StandardFieldInput
                          label="Token Hash"
                          name="mint_tx_hash"
                          required={values.token_type === 'ta_token'}
                          disabled={values.token_type === 'cp_token'}
                        />
                      </table>
                    </div>
                    <div className={styles.fieldSet}>
                      <table
                        className={
                          addedCompanyList.length && addTokenToggle
                            ? styles.fieldButtonWithCancel
                            : styles.fieldButton
                        }
                      >
                        <StandardFieldInput
                          component={Dropdown}
                          options={tokenList}
                          label="Tokens"
                          name="issuance_no"
                          required
                          style={{ minWidth: '225px' }}
                        />
                        <StandardFieldInput
                          label="Quantity"
                          name="quantity"
                          type="number"
                          disabled={values.token_type === 'ta_token'}
                          className={styles.qty}
                        />
                        <td className={styles.buttonSectionTd}>
                          {addedCompanyList.length && addTokenToggle ? (
                            <Button
                              theme="cancel"
                              className={styles.buttonAdd}
                              onClick={() => {
                                setAddTokenToggle(false);
                              }}
                            >
                              Cancel
                            </Button>
                          ) : null}
                          <Button
                            className={styles.buttonAdd}
                            onClick={handleAddCompany}
                            disabled={handleAddValidate()}
                          >
                            Add
                          </Button>
                        </td>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
          <div className={styles.transferIcon}>
            <Exchange size={20} />
          </div>
          {!detailPage ? (
            <div className={styles.cardLeft}>
              <div className={styles.companySectionCounter}>
                <Field
                  className={styles.counterPartyCompany}
                  component={Dropdown}
                  options={companyList}
                  name="counterparty_id"
                  style={{ border: 'none', padding: 0, minWidth: '170px' }}
                  placeholder={values.counter_party || 'Select Counter Party'}
                />
                <small>Please add tokens to swap.</small>
              </div>
              {addedCounterCompanyList.length ? (
                <div className={styles.listTable}>
                  <Table
                    columns={getAtomicExchangeAddColumns(
                      props,
                      addedCounterCompanyList,
                      setAddedCounterCompanyList
                    )}
                    data={addedCounterCompanyList}
                    bottumBar={false}
                  />
                </div>
              ) : null}
              {addedCounterCompanyList.length && !addTokenCounterToggle ? (
                <Button
                  theme="cancel"
                  onClick={() => {
                    setAddTokenCounterToggle(true);
                  }}
                >
                  + Add Token
                </Button>
              ) : null}
              {(!addedCounterCompanyList.length || addTokenCounterToggle) && (
                <div className={styles.formFields}>
                  <div className={styles.fieldSet}>
                    <table>
                      <StandardFieldInput
                        component={Dropdown}
                        options={tokenTypes}
                        label="Token Type"
                        name="token_type_op"
                        required
                      />
                      <StandardFieldInput
                        label="Token Hash"
                        name="mint_tx_hash_op"
                        disabled={values.token_type_op === 'cp_token'}
                        required={values.token_type_op === 'ta_token'}
                      />
                    </table>
                  </div>
                  <div className={styles.fieldSet}>
                    <table
                      className={
                        addedCounterCompanyList.length && addTokenCounterToggle
                          ? styles.fieldButtonWithCancel
                          : styles.fieldButton
                      }
                    >
                      <StandardFieldInput
                        component={Dropdown}
                        options={counterPartyTokenList}
                        label="Tokens"
                        name="issuance_no_op"
                        required
                        style={{ minWidth: '225px' }}
                      />
                      <StandardFieldInput
                        label="Quantity"
                        name="quantity_op"
                        type="number"
                        disabled={values.token_type_op === 'ta_token'}
                        className={styles.qty}
                      />
                      <td className={styles.buttonSectionTd}>
                        {addedCounterCompanyList.length &&
                        addTokenCounterToggle ? (
                          <Button
                            theme="cancel"
                            className={styles.buttonAdd}
                            onClick={() => {
                              setAddTokenCounterToggle(false);
                            }}
                          >
                            Cancel
                          </Button>
                        ) : null}
                        <Button
                          className={styles.buttonAdd}
                          onClick={counterPartyAdd}
                          disabled={handleCounterValidate()}
                        >
                          Add
                        </Button>
                      </td>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.cardLeft}>
              <div className={styles.counterPartyCompanyHeader}>
                {counterPartyCompanyName}
              </div>
              <b
                style={{
                  width: '100%',
                  margin: '12px 4px 4px 4px',
                  padding: '4px',
                }}
              >
                Offer Pending
              </b>
              <div style={{ width: '100%', margin: '4px', padding: '4px' }}>
                Please wait for counter party accepts or declines
              </div>
            </div>
          )}
        </div>
        {addedCounterCompanyList.length ? (
          <div className={styles.cardDateSection}>
            <label className={styles.dateTime}>Expiration Date *</label>
            <ReactDateTime
              value={new Date(initialValues.expiration_date)} // 12/12/2022 12:12:AM
              name="expiration_date"
              label="Expiration Date *"
              closeOnSelect
              onChange={onExpirationDateChange}
            />
          </div>
        ) : null}
        <div className={styles.buttonSection}>
          {!detailPage ? (
            <>
              <Button theme="cancel" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                theme="cancel"
                type="submit"
                style={{ border: '1px solid #4996e6' }}
                onClick={saveDraft}
              >
                Save Draft
              </Button>
              {!addedCounterCompanyList?.length ? (
                <Button
                  type="submit"
                  onClick={() => requestAnOffer(atomic_exchange_id)}
                >
                  Request An Offer
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={() => {
                    setModalProps({
                      component: AtomicSwapTransaction,
                      dontUseTray: true,
                      blockChainAddress,
                      addSnackBarItem,
                    });
                  }}
                >
                  Submit Offer
                </Button>
              )}
            </>
          ) : (
            <Button
              theme="discourage"
              onClick={() => atomicExchangeReject(atomic_exchange_id)}
            >
              Cancel Request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

AtomicExchangeCreateForm.selector = ({ tokens }) => ({
  tokens,
  atomicExchange: tokens.atomicExchange,
});

AtomicExchangeCreateForm.propTypes = {
  zeconomyUser: object.isRequired,
  getTokenIssuanceList: func.isRequired,
  searchCompanies: func.isRequired,
  getPortfolio: func.isRequired,
  saveAsDraft: func.isRequired,
  initialValues: object,
  submitSucceeded: bool.isRequired,
  requestAnOffer: func.isRequired,
  getTokenIssuance: func.isRequired,
  saveAsDraftUpdate: func.isRequired,
  getNextTransactionNo: func.isRequired,
  atomicExchangeReject: func.isRequired,
  setModalProps: func.isRequired,
  values: object,
};

AtomicExchangeCreateForm.defaultProps = {
  values: EMPTY_OBJECT,
  initialValues: EMPTY_OBJECT,
};
