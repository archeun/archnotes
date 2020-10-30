import React from 'react'
import {Layout, Row, Col} from 'antd';
import classnames from 'classnames';

import styles from '../styles/Home.module.css'

const {Header, Footer, Content} = Layout;

import dynamic from 'next/dynamic'
const ArchNotesEditor = dynamic(() => import('../components/arch-notes-editor'), {
    ssr: false
});

class Home extends React.Component {

    render() {
        return (
            <Layout className={styles.mainLayout}>
                <Header className={styles.header}>
                    <div className={styles.brandNameText}>archeun | NOTES</div>
                </Header>
                <Content className={styles.content}>
                    <Row className={styles.contentRow}>
                        <Col className={classnames(styles.contentRowLeftCol)} span={4}>Note List</Col>
                        <Col className={classnames(styles.contentRowRightCol)} span={20}>
                            <ArchNotesEditor/>
                        </Col>
                    </Row>
                </Content>
                <Footer className={styles.footer}>Copyright © ArCheun. All rights reserved</Footer>
            </Layout>
        );
    }
}

export default Home;
