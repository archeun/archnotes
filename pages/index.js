import React from 'react'
import {Layout, Row, Col} from 'antd';

const {Header, Footer, Content} = Layout;
import styles from '../styles/Home.module.css'
import classnames from 'classnames';

export default function Home() {
    return (
        <Layout className={styles.mainLayout}>
            <Header className={styles.header}>
                <img height='55px' src='./logo.png'/>
            </Header>
            <Content className={styles.content}>
                <Row className={styles.contentRow}>
                    <Col className={classnames(styles.contentRowLeftCol, styles.bordered)} span={4}>Note List</Col>
                    <Col className={classnames(styles.contentRowRightCol, styles.bordered)} span={20}>Note Editor</Col>
                </Row>
            </Content>
            <Footer className={styles.footer}>Copyright © ArCheun. All rights reserved</Footer>
        </Layout>
    )
}
