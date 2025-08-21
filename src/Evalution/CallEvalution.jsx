import { useParams } from "react-router-dom";
// import Header from "../Evalution/Header";
import AudioPlayer from "../Evalution/AudioPlayer";
import Tabs from "../Evalution/Tabs";
 
const CallEvaluation = () => {
  const { call_id } = useParams(); // Extract call_id from URL params
 
  return (
    <>
      {/* <Header callId={call_id} />  Changed prop name to callId */}
      <AudioPlayer call_id={call_id} />
      <Tabs call_id={call_id} />
    </>
  );
};  
 
export default CallEvaluation;
 