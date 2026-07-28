import VisualPage from "@/components/hq/pages/VisualPage";
import VisualPageV2 from "@/components/hq/pages/VisualPageV2";
import _ from "lodash";
import { withRouter } from "next/dist/client/router";
import React from "react";
import { connect } from "react-redux";

const VisualRoute = () => {
  // return <VisualPage />;
  return <VisualPageV2 />;
};

export async function getStaticProps(context) {
  return {
    props: {
      cookie: _.get(context, ["req", "headers", "cookie"]) || null,
    },
  };
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(VisualRoute));
