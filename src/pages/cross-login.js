import CrossLoginPage from '@/components/auth/pages/CrossLoginPage'
import _ from 'lodash'
import { withRouter } from 'next/dist/client/router'
import React from 'react'
import { connect } from 'react-redux'



const Index = ({ initialData }) => {
    return (
        <>
            <CrossLoginPage />
        </>
    )
}

export async function getStaticProps(context) {

    return {
        props: {
            cookie: _.get(context, ['req', 'headers', 'cookie']) || null,
        }
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Index))
