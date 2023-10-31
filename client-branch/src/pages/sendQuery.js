import {Button, Form, Input} from 'antd';
import {MDBContainer, MDBNavbar, MDBNavbarBrand,} from "mdb-react-ui-kit";
import axios from "axios";
import Swal from "sweetalert2";

const {TextArea} = Input;

export default function SendQuery() {
    const [form] = Form.useForm();

    const onFinish = (values) => {

        axios.post(`${process.env.REACT_APP_SERVER_URL}/message`, values).then(
            (response) => {
                console.log(response);
                Swal.fire({
                    title: 'Success',
                    text: 'Message sent successfully',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                })
                form.resetFields();
            }
        ).catch((error) => {
            console.log(error);
            Swal.fire({
                title: 'Error',
                text: 'Message not sent',
                icon: 'error',
                confirmButtonText: 'Ok'
            })

        })

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <div>
            <header>
                <MDBNavbar expand='lg' light bgColor='light'>
                    <MDBContainer fluid>
                        <MDBNavbarBrand href='#'>Branch International</MDBNavbarBrand>
                    </MDBContainer>
                </MDBNavbar>

            </header>
            <MDBContainer fluid>
                <div style={{textAlign: "center", margin: "auto", width: "50%", paddingTop: "3%"}}>
                    <h1>Send Message/Query</h1>
                    <br/>
                    <br/>
                    <Form
                        name="basic"
                        labelCol={{
                            span: 8,
                        }}
                        wrapperCol={{
                            span: 16,
                        }}
                        style={{
                            maxWidth: 600,
                        }}
                        initialValues={{
                            remember: true,
                        }}
                        form={form}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="User ID"
                            name="senderId"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your userid!',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="Message"
                            name="message"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input query/message!',
                                },
                            ]}
                        >
                            <TextArea rows={4}/>
                        </Form.Item>


                        <Form.Item
                            wrapperCol={{
                                offset: 8,
                                span: 16,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Send
                            </Button>
                        </Form.Item>
                    </Form>

                </div>

            </MDBContainer>
        </div>
    )
}
