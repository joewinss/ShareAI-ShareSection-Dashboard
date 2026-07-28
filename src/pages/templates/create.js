import CreateTemplate from '@/components/templates/pages/CreateTemplate'
import _ from 'lodash'
import { withRouter } from 'next/dist/client/router'
import React from 'react'
import { connect } from 'react-redux'



const index = ({ }) => {
    return (
        <>
            <CreateTemplate />
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(index))