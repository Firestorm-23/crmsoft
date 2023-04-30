import React, { Component } from 'react';


import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Button, Slide, Tooltip } from '@material-ui/core';

import CircularProgress from '@material-ui/core/CircularProgress';
import ErrorIcon from '@material-ui/icons/Error';
// import { isEmpty } from './tsclsGenUtils';

class MenuCls extends Component {
    /**
     * @props: isVisible, 
     * @returns 
     */

    constructor(props) {
        super(props);
        var LMe = this;

        LMe.FArrOfIds = [];
    }

    pvtGetListItems() {
        /**
         * INTENT: This function will return the list components
         */
        var LMe = this,
            LArrSyllabus = LMe.props.arrMenuItems,
            LArrComponent = [];

        if (LArrSyllabus === 0) {
            LArrComponent.push(
                <div key={'loading-syllabus-list'} className="tsMiddle">
                    <CircularProgress key="loading-cmp" />
                </div>
            );

            return LArrComponent;
        }

        if (LArrSyllabus === -1) {
            LArrComponent.push(
                <div key={'error-syllabus'} className="tsMiddle">
                    <ErrorIcon htmlColor="red" /><p className="tsHelpText" style={{ margin: '0 0 0 5px' }}>Error occurred!</p>
                </div>);

            return LArrComponent;
        }

        if (LArrSyllabus === -2) {
            LArrComponent.push(
                <div key={'error-syllabus'} className="tsMiddle">
                    <ErrorIcon htmlColor="red" /><p className="tsHelpText" style={{ margin: '0 0 0 5px' }}>Software Expired!</p>
                </div>);

            return LArrComponent;
        }

        LArrSyllabus = LArrSyllabus.items;

        LArrComponent = LMe.pvtCreateTreeCmp(LArrSyllabus);

        var LTreeCmp = (
            <div style={{ flex: 1 }}>
                <TreeView
                    // className={classes.root}
                    defaultExpanded={LMe.FArrOfIds}
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    onNodeSelect={LMe.props.OnNodeSelect}
                    key="TreePanel"
                    selected={[LMe.props.Paramalink]}
                >
                    {LArrComponent}
                </TreeView>
            </div>
        );


        return LTreeCmp;
    }

    pvtCreateTreeCmp(p_arrTree) {
        /**
         * INTENT: This function will create tree components
         */
        var LMe = this,
            LCmp,
            LRecord,
            LHint,
            LArrComponent = [],
            LLenSyllabus;

        LLenSyllabus = p_arrTree.length;

        for (var LIndex = 0; LIndex < LLenSyllabus; LIndex++) {

            LRecord = p_arrTree[LIndex];
            LHint = LRecord.toolTip || LRecord.displayTxt || '';

            if (LRecord.hidden === true) {
                continue;
            }

            // If hint is not present then show display text as a hint

            if (LRecord.children !== undefined) {
                // Parent

                LCmp = LMe.pvtCreateTreeCmp(LRecord.children);

                LArrComponent.push(
                    <TreeItem label={
                        <Button fullWidth={true} style={{ justifyContent: 'flex-start', cursor: 'grab' }} size="small">
                            <b>{LRecord.displayTxt}</b>
                        </Button>
                    } nodeId={LRecord.id} key={LRecord.id + 'key'}>
                        {LCmp}
                    </TreeItem>
                );
            }
            else {
                // Child
                LArrComponent.push(
                    <TreeItem label={
                        <Tooltip title={LHint} placement="right" key={LRecord.id + 'tooltipmenukey'}>
                            <Button fullWidth={true} style={{ justifyContent: 'flex-start' }} size="small">
                                {LRecord.displayTxt}
                            </Button>
                        </Tooltip>
                    } nodeId={LRecord.id} key={LRecord.id + 'key'}>
                        {LCmp}
                    </TreeItem>
                );
            }

            LMe.FArrOfIds.push(LRecord.id);
        }

        return LArrComponent;
    }

    render() {
        var LMe = this;

        return (
            <Slide direction="right" in={LMe.props.isVisible} mountOnEnter unmountOnExit>
                <div style={{
                    width: '100%',
                    maxWidth: 270,
                    backgroundColor: '#fff',
                    zIndex: 1,
                    position: 'relative',
                    overflow: 'auto',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '4px 4px 10px #bbb'
                }}>
                    {LMe.pvtGetListItems()}
                </div>
            </Slide>
        );
    }
}

export default MenuCls;