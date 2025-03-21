interface ApiResponseType<T> {
    message:string
    success: true
    data:T
}


class ApiResponse<T> implements ApiResponseType<T> {
    message: string;
    success: true;
    data: T;
   constructor(message:string,data:T) {
    this.message = message
    this.success = true
    this.data = data
   }
}


export default ApiResponse


