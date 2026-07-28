import AutoGenListing from "@/components/autoGen/pages/AutoGenListing";
import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "next/dist/client/router";

const index = () => {
  return (
    <>
      <AutoGenListing />
    </>
  );
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(index));

