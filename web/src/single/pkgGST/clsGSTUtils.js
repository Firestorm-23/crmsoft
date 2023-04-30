import { GenConstants } from '../../tsclsGenConstants';
import {
    tsGetDateFromServerDateForInpField, tsGetInvoiceDispNoByInvoiceNo,
    tsGetInvoiceDispNameByActionCode,
    tsGetGstAmount,
    tsGetIGSTAmount,
} from '../../tsclsGenUtils';

class clsGSTUtils {

    GetGSTR1Columns() {
        /**
         * @method GetGSTR1Columns
         * This method will return the columns (All the fields for GSTR1 Report)
         */

        // var LMe = this;

        return [
            {
                field: 'cstGSTNo',
                headerName: 'GSTIN/UIN of Recipient',
                headerClassName: 'tsGridHeader',
                width: 180
            },
            {
                field: 'cstName',
                headerName: 'Customer Name',
                headerClassName: 'tsGridHeader',
                width: 180
            },
            {
                field: 'isPurchaserInvoice',
                headerName: 'Transcation Type',
                headerClassName: 'tsGridHeader',
                width: 180,
                renderCell: (params) => (
                    //The value of 'isPurchaserInvoice' flag is always true in GSTR1 case
                    <span>
                        {params.value === 1 ? 'Purchase' : 'Sale'}
                    </span>
                ),
            },
            {
                field: 'invoiceDate',
                headerName: 'Date',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => {

                    return tsGetDateFromServerDateForInpField(params.value);
                },
            },
            // {
            //     field: 'invoiceType',
            //     headerName: 'Invoice Type',
            //     headerClassName: 'tsGridHeader',
            //     minWidth: 157,
            //     renderCell: (params) => (
            //         <span>
            //             {tsGetInvoiceDispNameByActionCode(params.value)}
            //         </span>
            //     ),
            // },
            {
                field: 'invoiceNo',
                headerName: 'Invoice No',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        {tsGetInvoiceDispNoByInvoiceNo(params.value, params.getValue(params.id, 'invoiceType'))}
                    </span>
                ),
            },
            {
                field: 'GrandTotal',
                headerName: 'Value',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        {'Rs. ' + (params.value || 0)}
                    </span>
                ),
            },
            {
                field: 'CESS Rate',//Calculated Field
                headerName: 'CESS Rate',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: (params) => (
                    <span>
                        {'0'}
                    </span>
                ),
            },
            {
                field: 'TaxableAmount',
                headerName: 'Taxable',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        {(params.value).toFixed(2)}
                    </span>
                ),
            },
            {
                field: 'Reverse Charge',//Calculated Field
                headerName: 'Reverse Charge',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        {'N'}
                    </span>
                ),
            },
            {
                field: GenConstants().IGST,//Calculated Field
                headerName: 'IGST',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: (params) => (
                    <span>
                        Rs.{tsGetIGSTAmount(params.getValue(params.id, 'products'), params.getValue(params.id, 'GrandTotal'), 'soldPrice')}
                    </span>
                ),
            },
            {
                field: GenConstants().CGST,//Calculated Field
                headerName: 'CGST',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: (params) => (
                    <span>
                        Rs.{tsGetGstAmount(params.getValue(params.id, 'products'), params.getValue(params.id, 'GrandTotal'), 'soldPrice')}
                    </span>
                ),
            },
            {
                field: GenConstants().SGST,//Calculated Field
                headerName: 'SGST',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: (params) => (
                    <span>
                        Rs.{tsGetGstAmount(params.getValue(params.id, 'products'), params.getValue(params.id, 'GrandTotal'), 'soldPrice')}
                    </span>
                ),
            },
        ];
    }

    GetInvoiceWiseProfitColumns() {
        /**
         * @method GetGSTR1Columns
         * This method will return the columns (All the fields for GSTR1 Report)
         */
        return [
            {
                field: 'cstName',
                headerName: 'Customer Name',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                flex: 1
            },
            {
                field: 'invoiceDate',
                headerName: 'Date',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => {

                    return tsGetDateFromServerDateForInpField(params.value);
                },
            },
            {
                field: 'invoiceType',
                headerName: 'Invoice Type',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        {tsGetInvoiceDispNameByActionCode(params.value)}
                    </span>
                ),
            },
            {
                field: 'invoiceNo',
                headerName: 'Invoice No',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: (params) => (
                    <span>
                        {tsGetInvoiceDispNoByInvoiceNo(params.value, params.getValue(params.id, 'invoiceType'))}
                    </span>
                ),
            },
            {
                field: 'TaxableAmount',
                headerName: 'Taxable',
                headerClassName: 'tsGridHeader',
                minWidth: 130,
                renderCell: (params) => (
                    <span>
                        {(params.value).toFixed(2)}
                    </span>
                ),
            },
            {
                field: 'grandTotal',
                headerName: 'Total Amount',
                headerClassName: 'tsGridHeader',
                minWidth: 160,
                renderCell: (params) => (
                    <span>
                        {'Rs. ' + (params.value || 0)}
                    </span>
                ),
            },
            {
                field: 'ProfitPerInvoice',
                headerName: 'Profit / Loss Amount',
                headerClassName: 'tsGridHeader',
                cellClassName: (params) => params.value > 0 ? 'tsGridSuccessCell' : 'tsGridFailureCell',
                width: 250,
                renderCell: (params) => {
                    var LValue = params.value;

                    if (LValue > 0) {
                        return <span title='Profit Amount calculated from "Sold Quantity" by "Sold Amount".'>{'Rs. ' + Math.abs(LValue)}</span>;
                    }
                    return <span title='Loss Amount calculated from "Sold Quantity" by "Sold Amount".'>{'Rs. ' + Math.abs(LValue)}</span>;
                }
            },
        ];
    }

    GetB2CSColumns() {
        /**
         * @method GetB2CSColumns
         * This method will return the columns (All the fields for GSTR1 Report)
         */
        return [
            {
                field: 'type',
                headerName: 'Type',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        OE
                    </span>
                ),
            },
            {
                field: 'State',
                headerName: 'Place Of Supply',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                flex: 1
            },
            {
                field: 'ApplicableTaxRate',//Not coming from DB
                headerName: 'Applicable % of Tax Rate',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'Rate',
                headerName: 'Rate',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'TaxableAmount',
                headerName: 'Taxable Value',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        {(params.value).toFixed(2)}
                    </span>
                ),
            },
            {
                field: 'cessAmount',
                headerName: 'Cess Amount',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        0.0
                    </span>
                ),
            },
            {
                field: 'ECommerceGSTIN',
                headerName: 'E-Commerce GSTIN',
                headerClassName: 'tsGridHeader',
                minWidth: 230
            }
        ];
    }

    GetB2CLColumns() {
        /**
         * @method GetB2CLColumns
         * This method will return the columns (All the fields for GSTR1 Report)
         */
        return [
            {
                field: 'invoiceNo',
                headerName: 'Invoice Number',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: (params) => (
                    <span>
                        {tsGetInvoiceDispNoByInvoiceNo(params.value, params.getValue(params.id, 'invoiceType'))}
                    </span>
                ),
            },
            {
                field: 'invoiceDate',
                headerName: 'Invoice Date',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => {

                    return tsGetDateFromServerDateForInpField(params.value);
                },
            },
            {
                field: 'GrandTotal',
                headerName: 'Invoice Value',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        {'Rs. ' + (params.value || 0)}
                    </span>
                ),
            },
            // {
            //     field: 'type',
            //     headerName: 'Type',
            //     headerClassName: 'tsGridHeader',
            //     minWidth: 180,
            //     renderCell: (params) => (
            //         <span>
            //             OE
            //         </span>
            //     ),
            // },
            {
                field: 'State',
                headerName: 'Place Of Supply',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                flex: 1
            },
            {
                field: 'ApplicableTaxRate',//Not coming from DB
                headerName: 'Applicable % of Tax Rate',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'Rate',
                headerName: 'Rate',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'TaxableAmount',
                headerName: 'Taxable Value',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        {(params.value).toFixed(2)}
                    </span>
                ),
            },
            {
                field: 'cessAmount',
                headerName: 'Cess Amount',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        0.0
                    </span>
                ),
            },
            {
                field: 'ECommerceGSTIN',
                headerName: 'E-Commerce GSTIN',
                headerClassName: 'tsGridHeader',
                minWidth: 230
            }
        ];
    }

    GetB2BColumns() {
        /**
         * @method GetB2BColumns
         * This method will return the columns (All the fields for GSTR1 Report)
         */
        return [
            {
                field: 'cstGSTNo',
                headerName: 'GSTIN/UIN of Recipient',
                headerClassName: 'tsGridHeader',
                width: 180
            },
            {
                field: 'cstName',
                headerName: 'Receiver Name',
                headerClassName: 'tsGridHeader',
                width: 180
            },
            {
                field: 'invoiceNo',
                headerName: 'Invoice Number',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: (params) => (
                    <span>
                        {tsGetInvoiceDispNoByInvoiceNo(params.value, params.getValue(params.id, 'invoiceType'))}
                    </span>
                ),
            },
            {
                field: 'invoiceDate',
                headerName: 'Invoice Date',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => {

                    return tsGetDateFromServerDateForInpField(params.value);
                },
            },
            {
                field: 'GrandTotal',
                headerName: 'Invoice Value',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        {'Rs. ' + (params.value || 0)}
                    </span>
                ),
            },
            {
                field: 'State',
                headerName: 'Place Of Supply',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                flex: 1
            },
            {
                field: 'ReverseCharge',//Not comming from DB
                headerName: 'Reverse Charge',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        N
                    </span>
                ),
            },
            {
                field: 'ApplicableTaxRate',//Not coming from DB
                headerName: 'Applicable % of Tax Rate',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'GSTInvoiceType',//Not comming from DB
                headerName: 'Invoice Type',
                headerClassName: 'tsGridHeader',
                minWidth: 157,
                renderCell: (params) => (
                    <span>
                        Regular
                    </span>
                ),
            },
            {
                field: 'ECommerceGSTIN',//Not comming from DB
                headerName: 'E-Commerce GSTIN',
                headerClassName: 'tsGridHeader',
                minWidth: 230
            },
            {
                field: 'Rate',
                headerName: 'Rate',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'TaxableAmount',
                headerName: 'Taxable Value',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        {(params.value).toFixed(2)}
                    </span>
                ),
            },
            {
                field: 'cessAmount',//Not comming from DB
                headerName: 'Cess Amount',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        0.0
                    </span>
                ),
            }
        ];
    }

    GetHSNColumns() {

        return [
            {
                field: 'hsn',
                headerName: 'HSN',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'productName',
                headerName: 'Description',
                headerClassName: 'tsGridHeader',
                minWidth: 200
            },
            //Uncomment following code after UQC implementation done
            // {
            //     field: 'uqc',
            //     headerName: 'UQC',
            //     headerClassName: 'tsGridHeader',
            //     minWidth: 180
            // },
            {
                field: 'qty',
                headerName: 'Total Quantity',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'TotalVal',
                headerName: 'Total Value',
                headerClassName: 'tsGridHeader',
                minWidth: 180
            },
            {
                field: 'TaxableAmount',
                headerName: 'Taxable Value',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        {(params.value).toFixed(2)}
                    </span>
                ),
            },
            {
                field: 'IGST',//Calculated Field
                headerName: 'IGST',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: this.pvtGetIGST
            },
            {
                field: 'cgst',//Calculated Field
                headerName: 'CGST',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: this.pvtGetGST
            },
            {
                field: 'sgst',//Calculated Field
                headerName: 'SGST',
                headerClassName: 'tsGridHeader',
                minWidth: 150,
                renderCell: this.pvtGetGST
            },
            {
                field: 'cessAmount',//Not comming from DB
                headerName: 'Cess Amount',
                headerClassName: 'tsGridHeader',
                minWidth: 180,
                renderCell: (params) => (
                    <span>
                        0.0
                    </span>
                ),
            }
        ];
    }

    pvtGetGST(params) {

        return <span>
            Rs.{tsGetGstAmount([params.row], params.getValue(params.id, 'TotalVal'), 'TotalVal')}
        </span>;
    }

    pvtGetIGST(params) {

        return <span>
            Rs.{tsGetIGSTAmount([params.row], params.getValue(params.id, 'TotalVal'), 'TotalVal')}
        </span>;
    }
}

export default clsGSTUtils;