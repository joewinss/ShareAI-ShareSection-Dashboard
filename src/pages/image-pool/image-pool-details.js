
import ImagePoolPage from '@/components/imagePool/pages/ImagePoolPage'
import ViewImagePoolDetailsPage from '@/components/imagePool/pages/ViewImagePoolDetailsPage'
import _ from 'lodash'
import { withRouter } from 'next/dist/client/router'
import React from 'react'
import { connect } from 'react-redux'



const index = ({ }) => {
    return (
        <>
            <ViewImagePoolDetailsPage />
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