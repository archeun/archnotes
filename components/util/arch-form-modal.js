import React, {useState} from 'react';
import {Modal, Button, Form, Input} from 'antd';

function ArchFormModal(props) {

    const [modalState, setModalState] = useState({confirmLoading: false});
    const [form] = Form.useForm();

    const handleOk = async () => {
        setModalState({confirmLoading: true});

        try {
            const values = await form.validateFields();
            form.resetFields();
            await props.onOkValid(values);
            setModalState({confirmLoading: false});
        } catch (error) {
            form.resetFields();
            props.onOkInValid(error);
            setModalState({confirmLoading: false});
        }
    };

    const handleCancel = () => {
        form.resetFields();
        props.onCancel();
    };
    return (
        <>
            <Modal
                destroyOnClose={true}
                title={props.title}
                visible={props.visible}
                onOk={handleOk}
                afterClose={() => form.resetFields()}
                confirmLoading={modalState.confirmLoading}
                onCancel={handleCancel}>

                <Form form={form}
                      preserve={false}
                      layout="vertical"
                      name={props.formName}
                      initialValues={props.formInitialValues}>
                    {props.children}
                </Form>

            </Modal>
        </>
    );
}

export default ArchFormModal;
