import { useState, useRef } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { ThreeCircles } from 'react-loader-spinner'

const url = '/upload-marks';

const UploadMarks = () => {
    const semRef = useRef();
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const handleSendFiles = () => {
        setLoading(true);
        const semVal = semRef.current.value;

        const controller = new AbortController();

        const sendFiles = async () => {
            try {
                await axiosPrivate.get(url.concat("/send-files"), {
                    params: {semVal},
                    signal: controller.signal
                });
                setLoading(false);
                setUploadStatus(false);
                window.alert("Emailed the file successfully");
                window.location.reload();
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        }

        sendFiles();

        return () => {
            controller.abort();
        }

    }

    const handleFiles = () => {
        setLoading(true);
        const controller = new AbortController();

        const uploadFiles = async () => {
            const myFiles = document.getElementById('myFiles').files;
            console.log(myFiles);

            const formData = new FormData();

            Object.keys(myFiles).forEach(key => {
                formData.append(myFiles.item(key).name, myFiles.item(key));
            });

            console.log(formData);
            console.log(semRef.current.value);
            

            try {
                const response = await axiosPrivate.post(url.concat("/file-upload"), formData, {
                    signal: controller.signal,
                    headers: { "Content-Type": "multipart/form-data" }
                });
                setLoading(false);
                setUploadStatus(true);
                alert(response.data.message + " excel file successfully uploaded");
            } catch (error) {
                setLoading(false);
                alert(error.response.data.message);
                console.log(error);
            }

        }

        uploadFiles();

        return () => {
            controller.abort();
        }
    }

    return (
        <div className="bg-background flex flex-col flex-grow md:w-5/6">
            <div className="px-8 pt-4 flex flex-row justify-between flex-wrap">
                <div className="flex flex-row mt-6 items-center">
                    <h2 className="text-xl font-Outfit-Bold"><span className="whitespace-nowrap">SELECT SEMESTER</span></h2>
                    <select ref={semRef} className="h-10 px-3 py-2 ml-5 rounded-[20px] shadow-sm border-gray-300 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-green-login">
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                    </select>
                </div>

                <div className="flex flex-row justify-center items-center mt-6">
                    <h2 className="text-xl font-Outfit-Bold"><span className="whitespace-nowrap">USN_MARKS_RESULTS</span></h2>
                    <input type="file" id="myFiles" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" multiple className="font-Outfit-Regular ml-5" />
                    <button className="bg-green-500 hover:bg-green-400 text-white font-Outfit-Bold h-10 w-[10rem] rounded-[20px]" onClick={handleFiles}>UPLOAD FILE</button>
                </div>
            </div>
            {
                uploadStatus && (
                    <div className='flex flex-row justify-center items-center mt-12'>
                    <button className="bg-blue-500 hover:bg-blue-400 text-white font-Outfit-Bold h-10 w-[10rem] rounded-[20px]" onClick={handleSendFiles}>MAIL THE FILES</button>
                    </div>
                )
            }
            <div className='mt-12'>
                {
                    loading && <ThreeCircles
                        height="65"
                        width="65"
                        color="#23ca85"
                        wrapperStyle={{
                            "position": "absolute",
                            "left": "55%",
                            "top": "50%"
                        }}
                        visible={true}
                    />
                }
            </div>
        </div>
    )
}

export default UploadMarks