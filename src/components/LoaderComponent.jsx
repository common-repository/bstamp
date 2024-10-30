import { Spinner } from "reactstrap";
import "./LoaderComponent.css";

const LoaderComponent = () => {
  return (
    <div className="loader-wrapper">
      <Spinner type="grow" color="primary" />
    </div>
  );
};

export default LoaderComponent;