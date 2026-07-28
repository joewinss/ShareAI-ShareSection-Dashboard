import PendingContentPage from '@/components/templates/pages/PendingContentPage'
import _ from 'lodash'
import { withRouter } from 'next/dist/client/router'
import { connect } from 'react-redux'



const index = ({ }) => {
    return (
        <>
            <PendingContentPage />
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
