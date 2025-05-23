import hostedFileLinks from "../../../../../common/hostedFileLinks.json";
import { ReplaceFileAggregator } from "../../../utils";
import getSteps from "./steps";

const framework = {
  build({ filenames, files, steps }) {
    const replacementAggregator = new ReplaceFileAggregator();
    getSteps(steps, files, replacementAggregator);
    filenames.push(hostedFileLinks.REACT_WEB3AUTHCONTEXT_TSX);
    filenames.push(hostedFileLinks.REACT_MAIN_TSX);
    filenames.push(hostedFileLinks.REACT_APP_TSX);
    filenames.push(hostedFileLinks.REACT_PACKAGE_JSON);
    filenames.push(hostedFileLinks.REACT_INDEX_HTML);
    filenames.push(hostedFileLinks.REACT_GET_BALANCE_TSX);
    filenames.push(hostedFileLinks.REACT_SEND_TRANSACTION_TSX);
    filenames.push(hostedFileLinks.REACT_SWITCH_NETWORK_TSX);

    return { filenames, files, steps };
  },
};

export default framework;
