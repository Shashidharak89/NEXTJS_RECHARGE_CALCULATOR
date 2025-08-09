import { useUser } from "context/UserContext";

const Data = () => {
    const {isLogin}=useUser();
    if(isLogin){
        return(
            <div>
                <h1>Please Login first..</h1>
            </div>
        );
    }

    return (
        <div>
            <h1> This is homepage</h1>
        </div>
    );
}

export default Data;