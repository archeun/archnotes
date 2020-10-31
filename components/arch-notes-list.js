import React from 'react';
import {Card, Result, Tree} from 'antd';
import {DownOutlined, SmileOutlined} from '@ant-design/icons';
import classnames from "classnames";
import styles from "../styles/ArchNotesList.module.css";

class ArchNotesList extends React.Component {

    render() {
        return (
            <div>
                <Card className={classnames(styles.notesListCard)} title="My Notes" loading={this.props.loading}>
                    <Tree
                        showLine
                        switcherIcon={<DownOutlined/>}
                        defaultExpandedKeys={['0-0-0']}
                        onSelect={this.onSelect}
                        treeData={this.props.notesAndDirectories}
                    />
                    {this.props.loggedInUser ? '' : <Result icon={<SmileOutlined/>} title="Sign in to start creating notes"/>}
                </Card>
            </div>
        );
    }

}

export default ArchNotesList;