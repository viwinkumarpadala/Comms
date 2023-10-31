
import React, {useEffect, useState} from "react"
import io from 'socket.io-client';
import axios from 'axios';
import Swal from 'sweetalert2'
import CannedMessage from "./cannedMsg"
import {
    MDBBtn,
    MDBContainer,
    MDBIcon,
    MDBInput,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarItem,
    MDBNavbarLink,
    MDBNavbarNav,
    MDBSpinner
} from 'mdb-react-ui-kit';
import {Button, Form, Input, Modal, Result, Select, Table, Tag} from 'antd';

const {TextArea} = Input;
const {Option} = Select;

const Client = () => {
    // Define columns for the message table
    const columns = [
        {
            title: 'Id',

            width: 100,
            dataIndex: 'senderId',
            key: 'senderId',
        },
        {
            title: 'Message',
            width: 200,
            dataIndex: 'message',
            key: 'message',
            ellipsis: true,

        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (text, record) => <>
                {record.priority === '3' ? <Tag color="success">Low</Tag> : record.priority === '2' ?
                    <Tag color="warning">Medium</Tag> : <Tag color="error">High</Tag>}
            </>
        },
        {
            title: 'Action',
            key: 'operation',
            fixed: 'right',
            width: 150,
            render: (text, record) => <><MDBBtn color='link' rounded size='sm' onClick={() => {
                showModal1(record);
            }
            }>
                View Message
            </MDBBtn><MDBBtn color='link' rounded size='sm' onClick={() => {
                showModal2(record);
            }
            }>
                Send Response
            </MDBBtn></>,
        },
    ];

    const [agentId, setagentId] = useState(localStorage.getItem("agentId"));
    const [message, setmessage] = useState([]);
    const [originalMessages, setOriginalMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [msg, setMsg] = useState('');
    const [response, setResponse] = useState('');
    const [msgId, setMsgId] = useState('');
    const [selectedMessageType, setSelectedMessageType] = useState("");
    const [selectedMessage, setSelectedMessage] = useState("");

    const showModal1 = (msg) => {
        setMsg(msg.message)
        setIsModalOpen1(true);
    };


    const handleCancel1 = () => {
        setIsModalOpen1(false);
        setIsModalOpen2(false);
    };


    const showModal2 = (msg) => {
        setMsgId(msg._id)
        setIsModalOpen2(true);
    };

    // Function to send response to the server
    const sendResponse = () => {
        if (msgId && response) {

            axios.post(`${process.env.REACT_APP_SERVER_URL}/response`, {
                messageId: msgId,
                response: response,
            })
                .then((response) => {
                    console.log('Response sent successfully', response);
                    handleDelete(msgId);
                    Swal.fire({
                        title: 'Success!',
                        icon: 'success',
                        confirmButtonText: 'Okay'
                    })
                })
                .catch((error) => {
                    console.error('Error sending response', error);
                    Swal.fire({
                        title: 'Failed!',
                        icon: 'error',
                        confirmButtonText: 'Okay'
                    })
                });
            setResponse('');
            setMsgId('');
            setSelectedMessage("");
            setSelectedMessageType("");
            setIsModalOpen2(false);
        }
    };


    const handleDelete = (messageId) => {
        // Filter out the deleted message from both message and originalMessages states
        const updatedMessages = message.filter((msg) => msg._id !== messageId);
        const updatedOriginalMessages = originalMessages.filter((msg) => msg._id !== messageId);

        setmessage(updatedMessages);
        setOriginalMessages(updatedOriginalMessages);
    };
    const handleMessageTypeChange = (value) => {
        setSelectedMessageType(value);
        setSelectedMessage(""); // Clear the selected message
    };

    const handleSelectedMessageChange = (value) => {
        setSelectedMessage(value);
        setResponse(value); // Automatically set the response based on selected message
    };


    useEffect(() => {
        console.log(`${process.env.REACT_APP_SERVER_URL}`)
         const socket = io.connect( `${process.env.REACT_APP_SERVER_URL}`);
        axios.get(`${process.env.REACT_APP_SERVER_URL}/getMessages/${agentId}`).then((res) => {
            setmessage(res.data.messages);
            setOriginalMessages(res.data.messages);
            setLoading(false);
        }).catch((err) => {
            console.error('Error fetching messages:', err);
        })
        socket.emit('agentOnline', agentId);
        socket.on('messageAssigned', (msg) => {
            if (message.find((message) => message._id === msg._id)) return;
            setmessage((prevMessages) => [...prevMessages, msg]);
            setOriginalMessages((prevMessages) => [...prevMessages, msg]);
        })
        return () => {
            socket.disconnect()
        };

    }, [])
    const handleSearch = (value) => {
        const searchText = value.toLowerCase();
        const filteredMessages = originalMessages.filter((msg) => {
            const idMatch = msg.senderId.toLowerCase().includes(searchText);
            const messageMatch = msg.message.toLowerCase().includes(searchText);
            return idMatch || messageMatch;
        });
        setmessage(filteredMessages);
    };
    return (
        <>
            {agentId === null && <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={<Button type="primary" onClick={() => {
                    window.location.href = "/";
                }}>Back Home</Button>}
            />}
            {agentId !== null && <div>
                <Modal title="Message/Query" open={isModalOpen1} okButtonProps={{hidden: true}}
                       cancelButtonProps={{hidden: true}} onCancel={handleCancel1} width={1000}
                       bodyStyle={{height: "250px"}}>
                    <p style={{paddingTop: "10px"}}>{msg}</p>
                </Modal>
                <Modal title="Respond Message/Query" open={isModalOpen2} okButtonProps={{hidden: true}}
                       cancelButtonProps={{hidden: true}} onCancel={handleCancel1} width={700}
                       bodyStyle={{height: "350px"}}>
                    <br/>
                    <Form
                        name="basic"
                        style={{
                            maxWidth: 600,
                        }}
                        initialValues={{
                            remember: true,
                        }}
                        autoComplete="off"
                    >
                        <Form.Item label="Canned Message Type">
                            <Select
                                value={selectedMessageType}
                                onChange={handleMessageTypeChange}
                            >
                                <Option value="">Select a message type</Option>
                                {Object.keys(CannedMessage).map((messageType) => (
                                    <Option key={messageType} value={messageType}>
                                        {messageType}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {selectedMessageType && (
                            <Form.Item label="Canned Message">
                                <Select
                                    value={selectedMessage}
                                    onChange={handleSelectedMessageChange}
                                >
                                    <Option value="">Select a message</Option>
                                    {CannedMessage[selectedMessageType].map((message, index) => (
                                        <Option key={index} value={message}>
                                            {message}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}

                        <Form.Item>
                            <TextArea rows={5} value={response} onChange={(e) => setResponse(e.target.value)}/>
                        </Form.Item>


                        <Form.Item>
                            <Button type="primary" onClick={sendResponse}>
                                Send
                            </Button>
                        </Form.Item>
                    </Form>

                </Modal>
                <header>
                    <MDBNavbar expand='lg' light bgColor='light'>
                        <MDBContainer fluid>
                            <MDBNavbarBrand href='#'>Comms</MDBNavbarBrand>
                            <MDBNavbarNav right fullWidth={false} className='mb-2 mb-lg-0'>
                                <MDBNavbarItem right className='me-3 me-lg-0'>
                                    <MDBNavbarLink href='/'>
                                        <MDBIcon fas icon="sign-out-alt"/>
                                    </MDBNavbarLink>
                                </MDBNavbarItem>

                            </MDBNavbarNav>
                        </MDBContainer>
                    </MDBNavbar>

                    <div className='text-center' style={{
                        padding: "2%"
                    }}>

                    </div>
                </header>
                <MDBContainer fluid>
                    {loading ? ( // Conditionally render the loader spinner
                        <div className='text-center' style={{paddingTop: "25px"}}>
                            <MDBSpinner grow color='primary'/>
                        </div>
                    ) : (
                        <>

                            <div style={{padding: "0 5% 0 5%"}}>
                                <div style={{width: "50%"}}>
                                    <MDBInput label='Search' id='typeText' type='text'
                                              onChange={(e) => handleSearch(e.target.value)}/>
                                </div>
                                <Table
                                    columns={columns}
                                    dataSource={[...message]}
                                    style={{paddingTop: "25px"}}
                                />
                            </div>
                        </>
                    )}
                </MDBContainer>

            </div>
            }
        </>
    )
}

export default Client