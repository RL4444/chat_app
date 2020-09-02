import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useSubscription, gql, useMutation } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

import { Container, Button, Row, Col, FormInput } from 'shards-react';

const link = new WebSocketLink({
    uri: `ws://localhost:4000/`,
    options: {
        reconnect: true,
    },
});
const client = new ApolloClient({
    link,
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
    subscription {
        messages {
            id
            user
            content
        }
    }
`;

const POST_MESSAGE = gql`
    mutation($user: String!, $content: String!) {
        postMessage(user: $user, content: $content)
    }
`;

const Messages = ({ user: currentUser }) => {
    const { data } = useSubscription(GET_MESSAGES);
    if (!data) {
        return <div>No data returned from GQL query</div>;
    }
    return (
        <>
            {data.messages.map(({ id, user, content }) => {
                const isUsersMessage = user === currentUser;
                return (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: isUsersMessage ? 'flex-end' : 'flex-start',
                            marginTop: '12px',
                        }}
                        key={id}
                    >
                        {!isUsersMessage && (
                            <div
                                style={{
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    background: '#c9c9c9',
                                    marginRight: '2em',
                                    border: '1px solid black',
                                    paddingTop: 10,
                                    textAlign: 'center',
                                    fontWeight: 700,
                                }}
                            >
                                {user.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div
                            style={{
                                borderRadius: '12px',
                                background: isUsersMessage ? 'green' : '#c9c9c9',
                                color: isUsersMessage ? 'white' : 'black',
                                padding: '12px',
                            }}
                        >
                            {content}
                        </div>
                    </div>
                );
            })}
        </>
    );
};

const Chat = () => {
    const [state, stateSet] = useState({
        user: 'OJ',
        content: '',
    });

    const [postMessage] = useMutation(POST_MESSAGE);

    const sendMessage = () => {
        if (state.content.length === 0) return;
        postMessage({
            variables: state,
        });
        stateSet({
            ...state,
            content: '',
        });
    };
    const { user } = state;
    return (
        <Container>
            <Messages user={user} />
            <Row style={{ marginTop: '2em' }}>
                <Col xs={2}>
                    <FormInput
                        label='User'
                        value={state.user}
                        onChange={(e) =>
                            stateSet({
                                ...state,
                                user: e.target.value,
                            })
                        }
                    />
                </Col>
                <Col xs={8}>
                    <FormInput
                        label='Message'
                        onKeyUp={(e) => {
                            if (e.keyCode === 13) {
                                sendMessage();
                            }
                        }}
                        value={state.content}
                        onChange={(e) =>
                            stateSet({
                                ...state,
                                content: e.target.value,
                            })
                        }
                    />
                </Col>
                <Button onClick={() => sendMessage()}>SEND</Button>
            </Row>
        </Container>
    );
};

export default () => {
    return (
        <ApolloProvider client={client}>
            <Chat />
        </ApolloProvider>
    );
};
