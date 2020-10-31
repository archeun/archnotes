import React from 'react';
import {Card, Result, Tree, Tooltip, Form, Input, Popconfirm, message} from 'antd';
import {DownOutlined, SmileOutlined, FileTextOutlined, DeleteOutlined, FolderAddOutlined, EditOutlined} from '@ant-design/icons';
import classnames from "classnames";
import styles from "../styles/ArchNotesList.module.css";
import ArchNotesService from "../util/arch-notes-service";
import ArchAuth from "../util/arch-auth";
import ArchFormModal from "./util/arch-form-modal";

const ModalUtil = {
    addEditModal: {
        props: {
            visible: false,
            id: 'add_edit_modal',
            title: 'Add Item',
            name: 'add_edit_modal',
            modalText: '',
            initialValues: {},
            onFormSubmitSuccess: () => {
            },
            onFormSubmitError: () => {
            },
        }
    },
    modalFormActionHandlers: {
        createDirectory: async (archNotesListComponent, values) => {
            return ModalUtil.modalFormActionHandlers.createItem(archNotesListComponent, values, 'createDirectory');
        },
        createNote: async (archNotesListComponent, values) => {
            return ModalUtil.modalFormActionHandlers.createItem(archNotesListComponent, values, 'createNote');
        },
        renameDirectory: async (archNotesListComponent, values) => {
            return ModalUtil.modalFormActionHandlers.renameItem(archNotesListComponent, values, 'renameDirectory');
        },
        renameNote: async (archNotesListComponent, values) => {
            return ModalUtil.modalFormActionHandlers.renameItem(archNotesListComponent, values, 'renameNote');
        },
        createItem: async (archNotesListComponent, values, funcName) => {
            const selectedItem = archNotesListComponent.state.selectedItem;
            const name = values.name;
            const parentDirId = selectedItem ? selectedItem.uid : null;
            const createdItem = await ArchNotesService[funcName](ArchAuth.getCurrentUser().uid, name, parentDirId);
            if (createdItem.id) {
                archNotesListComponent.closeAddEditModal();
                return archNotesListComponent.props.onNoteListChange();
            }
            return false;
        },
        renameItem: async (archNotesListComponent, values, funcName) => {
            const selectedItem = archNotesListComponent.state.selectedItem;
            if (selectedItem && selectedItem.uid) {
                const newName = values.name;
                await ArchNotesService[funcName](ArchAuth.getCurrentUser().uid, selectedItem.uid, newName);
                archNotesListComponent.closeAddEditModal();
                return archNotesListComponent.props.onNoteListChange();
            }
            return false;
        },
        onError: (archNotesListComponent, errors) => {
            console.log(errors);
        }
    }
}

class ArchNotesList extends React.Component {

    state = {
        selectedItem: null,
        modalProps: {
            addEditModal: ModalUtil.addEditModal.props
        }
    };

    constructor(props) {
        super(props);
        this.onAction = this.onAction.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.openAddEditModal = this.openAddEditModal.bind(this);
        this.closeAddEditModal = this.closeAddEditModal.bind(this);
        this.deleteSelectedItem = this.deleteSelectedItem.bind(this);
        this.onDragAndDropItem = this.onDragAndDropItem.bind(this);
    }

    openAddEditModal(customProps = {visible: true}) {
        const addEditModalProps = {...this.state.modalProps.addEditModal, ...customProps};
        this.setState({modalProps: {addEditModal: addEditModalProps}});
    }

    closeAddEditModal(customProps = {visible: false, initialValues: {}}) {
        const addEditModalProps = {...this.state.modalProps.addEditModal, ...customProps};
        this.setState({modalProps: {addEditModal: addEditModalProps}});
    }

    onAction(action) {
        const selectedItem = this.state.selectedItem;
        if (action === 'addDirectory' || action === 'addNote') {
            const isAddDir = action === 'addDirectory';
            this.openAddEditModal({
                visible: true,
                title: `Create ${isAddDir ? 'Directory' : 'Note'}`,
                modalText: `Create a ${isAddDir ? 'directory' : 'note'} under '${selectedItem ? selectedItem.name : ''}'`,
                onFormSubmitSuccess: isAddDir ? ModalUtil.modalFormActionHandlers.createDirectory : ModalUtil.modalFormActionHandlers.createNote,
                onFormSubmitError: ModalUtil.modalFormActionHandlers.onError,
            });
        } else if (action === 'rename') {
            if (selectedItem) {
                const isDirectory = selectedItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY;
                this.openAddEditModal({
                    visible: true,
                    title: isDirectory ? 'Rename Directory' : 'Rename Note',
                    modalText: `Rename ${isDirectory ? 'directory' : 'note'} '${selectedItem.name}'`,
                    initialValues: {name: selectedItem.name},
                    onFormSubmitSuccess: isDirectory ? ModalUtil.modalFormActionHandlers.renameDirectory : ModalUtil.modalFormActionHandlers.renameNote,
                    onFormSubmitError: ModalUtil.modalFormActionHandlers.onError,
                });
            }
        }
    }

    onSelect(itemUid, event) {
        if (event.selected) {
            this.setState({selectedItem: {type: event.node.type, uid: itemUid[0], name: event.node.title}});
        } else {
            this.setState({selectedItem: null})
        }
    }

    async deleteSelectedItem() {
        const selectedItem = this.state.selectedItem;
        if (selectedItem && selectedItem.uid) {
            let funcName;
            if (selectedItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY) {
                funcName = 'deleteDirectory';
            } else {
                funcName = 'deleteNote';
            }
            await ArchNotesService[funcName](ArchAuth.getCurrentUser().uid, selectedItem.uid);
            this.setState({selectedItem: null})
            return this.props.onNoteListChange();
        }
    }

    async onDragAndDropItem(event) {
        const draggedItem = event.dragNode;
        const parentItem = event.node;
        if (parentItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY || event.dropPosition === -1) {
            let parentId = parentItem.key;
            if (event.dropPosition === -1) {
                parentId = null;
            }
            if (draggedItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY) {
                await ArchNotesService.moveDirectoryOfUserToParent(ArchAuth.getCurrentUser().uid, draggedItem.key, parentId);
            } else {
                await ArchNotesService.moveNoteOfUserToDirectory(ArchAuth.getCurrentUser().uid, draggedItem.key, parentId);
            }
        }
        this.props.onNoteListChange();
    }

    render() {
        let actionItems = [];
        if (this.props.loggedInUser) {
            actionItems = [
                <Tooltip placement="bottom" title="Delete Item">
                    <Popconfirm
                        disabled={this.state.selectedItem === null}
                        placement='right'
                        title="Are you sure delete this item?"
                        onConfirm={this.deleteSelectedItem}
                        onCancel={() => {
                        }}
                        okText="Yes"
                        cancelText="No">
                        <DeleteOutlined onClick={() => this.onAction('delete')} key="delete"/>
                    </Popconfirm>
                </Tooltip>,
                <Tooltip placement="bottom" title="Add new directory">
                    <FolderAddOutlined onClick={() => this.onAction('addDirectory')} key="addDirectory"/>
                </Tooltip>,
                <Tooltip placement="bottom" title="Add new note">
                    <FileTextOutlined onClick={() => this.onAction('addNote')} key="addNote"/>
                </Tooltip>,
                <Tooltip placement="bottom" title="Rename Item">
                    <EditOutlined onClick={() => this.onAction('rename')} key="rename"/>
                </Tooltip>,
            ]
        }
        const addEditModalProps = this.state.modalProps.addEditModal;
        return (
            <div>
                <Card className='arch-noteslist-placeholder-card' actions={actionItems}/>
                <Card size='small' className={classnames(styles.notesListCard)} loading={this.props.loading}>
                    <Tree
                        draggable
                        blockNode
                        onDrop={this.onDragAndDropItem}
                        showLine
                        switcherIcon={<DownOutlined/>}
                        defaultExpandedKeys={['0-0-0']}
                        onSelect={this.onSelect}
                        treeData={this.props.notesAndDirectories}
                    />
                    {this.props.loggedInUser ? '' : <Result icon={<SmileOutlined/>} title="Sign in to start creating notes"/>}
                </Card>
                <ArchFormModal id={addEditModalProps.id}
                               title={addEditModalProps.title}
                               visible={addEditModalProps.visible}
                               onCancel={this.closeAddEditModal}
                               onOkValid={(values) => addEditModalProps.onFormSubmitSuccess(this, values)}
                               onOkInValid={(errors) => addEditModalProps.onFormSubmitError(this, errors)}
                               formInitialValues={addEditModalProps.initialValues}
                               formName={addEditModalProps.name}>
                    <p>{addEditModalProps.modalText}</p>
                    <Form.Item name="name" rules={[{required: true, message: 'Required'}]}>
                        <Input/>
                    </Form.Item>
                </ArchFormModal>
            </div>
        );
    }

}

export default ArchNotesList;