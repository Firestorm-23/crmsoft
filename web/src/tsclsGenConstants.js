
export function GenConstants() {

    return {
        CUSTOMER_CSTM_FIELDS: 'customerFields',
        PRODUCT_CSTM_FIELDS: 'productFields',
        STOCK_CSTM_FIELDS: 'stockFields',

        SYSTEM_FIELD: 'SYSTEM_FIELD',
        FIELD_TEXT: 'Text',
        FIELD_NUMBER: 'Number',
        FIELD_DATE: 'Date',
        GST_FIELD: 'GST_FIELD',
        STATE_FIELD: 'STATE_FIELD',

        PESTICIDES: 'Pesticides',
        PESTICIDE_SINGULAR_NAME: 'Pesticide',
        PESTICIDE_ACT_CODE: 'actInventory',//'actPesticide',

        FERTILZERS: 'Fertilizers',
        FERTILZER_SINGULAR_NAME: 'Fertilizer',
        FERTILZER_ACT_CODE: 'actFetilizer',

        OTHER_IT: 'Other', //IT means invoice type
        OTHER_IT_SINGULAR_NAME: 'Other',
        OTHER_IT_ACT_CODE: 'actOther',

        SEEDS: 'Seeds',
        SEED_SINGULAR_NAME: 'Seed',
        SEED_ACT_CODE: 'actSeed',

        PSUDO_INVOICE_TYPE_ALL: -1,

        PAYMENT_OUT: 'Payment Debit',
        PAYMENT_OUT_ACT_CODE: 'actPaymentOut',

        PAYMENT_IN: 'Payment Credit',
        PAYMENT_IN_ACT_CODE: 'actPaymentIn',

        GSTR1: 'GSTR-1',
        B2B: 'B2B',
        B2CL: 'B2CL',
        B2CS: 'B2CS',
        CDNR: 'CDNR',
        CDNUR: 'CDNUR',
        EXP: 'EXP',
        HSN: 'HSN',
        ITEM_WISE_SALE: 'ITEM WISE SALE',
        ITEM_WISE_SALE_RETURN: 'ITEM WISE SALE RETURN',
        ITEM_SUMMARY: 'ITEM SUMMARY',

        //Do not change the value of these 2 contants, as it saved in product table in DB
        IGST: 'IGST',
        CSGST: 'CSGST',


        CGST: 'CGST',
        SGST: 'SGST'
    };
}