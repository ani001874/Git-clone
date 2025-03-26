
interface ApiErrorType {
    message:string,
    statusCode:number,
    success:false,
    data:null
}



class ApiError extends Error implements ApiErrorType {
    statusCode: number;
    success: false;
    data:null;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.data = null
    }
}


export default ApiError