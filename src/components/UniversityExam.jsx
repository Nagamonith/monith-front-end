import DropDownInput from './DropDownInput';
import { useState, useRef, useEffect, useMemo } from 'react';
import Input from './Input';
import { ThreeCircles } from 'react-loader-spinner'
import UeRow from './UeRow';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const url = '/university-exam';

export default function UniversityExam() {
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [toggle, setToggle] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const semRef = useRef();
    const formRef = useRef();
    const dateRef = useRef();
    const timeRef = useRef();
    const branchRef = useRef();
    const subjectRef = useRef();
    const subcodeRef = useRef();
    const [subCodeArray, setSubCodeArray] = useState([]);
    const [subjectArray, setSubjectArray] = useState([]);
    const navigate = useNavigate();

    const handleToggle = () => {
        setToggle(!toggle);
    }

    const sortedExams = useMemo(() => {
        let list = exams.sort((a, b) => { return a.date.split("/").join("") - b.date.split("/").join("") });
        if (list.length > 0 && toggle)
            list = list.sort((a, b) => { if (a.branch < b.branch) { return -1; } if (a.branch > b.branch) { return 1; } return 0; });
        return list;
    }, [toggle, exams]);

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

            try {
                const response = await axiosPrivate.post(url.concat("/file-upload"), formData, {
                    signal: controller.signal,
                    headers: { "Content-Type": "multipart/form-data" }
                });
                setLoading(false);
                alert(response.data.message + " excel file successfully uploaded");
            } catch (error) {
                alert("Excel file upload unsuccessful");
                console.log(error);
            }

        }

        uploadFiles();

        return () => {
            controller.abort();
        }
    }

    const handleSchedule = (e) => {
        e.preventDefault();
        setLoading(true);
        const newExam = { date: dateRef.current.value, time: timeRef.current.value, sem: Number(semRef.current.options[semRef.current.selectedIndex].value), branch: branchRef.current.value, subject: subjectRef.current.value, subcode: subcodeRef.current.value };
        formRef.current.reset();
        dateRef.current.focus();

        console.log(newExam);

        let isMounted = true;
        const controller = new AbortController();

        const postSchedule = async () => {
            try {
                const response = await axiosPrivate.post(url, newExam, {
                    signal: controller.signal
                });
                isMounted && setExams(prev => [...prev, response.data]);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        }

        postSchedule();

        semRef.current.focus();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }

    const handleSubCode = () => {
        let isMounted = true;
        const controller = new AbortController();

        const subInfo = { sem: Number(semRef.current.options[semRef.current.selectedIndex].value), branch: branchRef.current.value, subject: subjectRef.current.value }

        console.log("In handleSubcode", subInfo);

        const getSubcode = async () => {
            try {
                const response = await axiosPrivate.get(url.concat("/subcode"), {
                    params: subInfo,
                    signal: controller.signal
                });
                if (isMounted) {
                    console.log(response.data);
                    setSubCodeArray(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        }

        getSubcode();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }

    const handleSubject = () => {
        let isMounted = true;
        const controller = new AbortController();

        const subjectInfo = { sem: Number(semRef.current.options[semRef.current.selectedIndex].value), branch: branchRef.current.value }

        console.log("In handleSubject", subjectInfo);

        const getSubjects = async () => {
            try {
                const response = await axiosPrivate.get(url.concat("/subjects"), {
                    params: subjectInfo,
                    signal: controller.signal
                });
                if (isMounted) {
                    console.log(response.data);
                    setSubjectArray(response.data);
                }

                const subCodeInfo = { sem: Number(semRef.current.options[semRef.current.selectedIndex].value), branch: branchRef.current.value, subject: response.data[0] }
                console.log("Here is subcodeInfo in handleSubject ", subCodeInfo);

                const response2 = await axiosPrivate.get(url.concat("/subcode"), {
                    params: subCodeInfo,
                    signal: controller.signal
                });
                if (isMounted) {
                    console.log(response2.data);
                    setSubCodeArray(response2.data);
                }
            } catch (error) {
                console.log(error);
            }
        }

        getSubjects();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const subjectInfo = { sem: Number(semRef.current.options[semRef.current.selectedIndex].value), branch: branchRef.current.value }

        console.log("Here is subjectInfo in useEffect ", subjectInfo);

        const getSubjects = async () => {
            try {
                const response = await axiosPrivate.get(url.concat("/subjects"), {
                    params: subjectInfo,
                    signal: controller.signal
                });
                if (isMounted) {
                    console.log(response.data);
                    setSubjectArray(response.data);
                }

                const subCodeInfo = { sem: Number(semRef.current.options[semRef.current.selectedIndex].value), branch: branchRef.current.value, subject: response.data[0] }
                console.log("Here is subcodeInfo in useEffect", subCodeInfo);

                const response2 = await axiosPrivate.get(url.concat("/subcode"), {
                    params: subCodeInfo,
                    signal: controller.signal
                });
                if (isMounted) {
                    console.log(response2.data);
                    setSubCodeArray(response2.data);
                }
            } catch (error) {
                console.log(error);
            }
        }

        getSubjects();

        const getSchedule = async () => {
            try {
                const response = await axiosPrivate.get(url.concat("/schedule"), {
                    signal: controller.signal
                });
                isMounted && setExams(response.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        }

        isMounted && getSchedule();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, [axiosPrivate])

    const handleDelete = (id) => {
        setLoading(true);
        let isMounted = true;
        const controller = new AbortController();

        const deleteSchedule = async () => {
            try {
                await axiosPrivate.delete(url.concat(`/${id}`), {
                    signal: controller.signal
                });
                isMounted && setExams(prev => prev.filter(item => item._id !== id));
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        }

        deleteSchedule();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }

    const handleClearall = () => {
        const confirmBox = window.confirm(
            "Do you want to clear the entire table in this page ?"
        )
        if (confirmBox) {
            console.log("Entire table deleted");
        }
    }

    const handleNext = () => {
        navigate('/seat-allocation')
    }

    return (
        <div className="bg-background flex flex-col flex-grow md:w-5/6">
            <div className="px-8 pt-4 flex flex-row justify-between flex-wrap">
                <div className="flex flex-row mt-6 items-center">
                    <h2 className="text-xl font-Outfit-Bold"><span className="whitespace-nowrap">SELECT SEMESTER</span></h2>
                    <select ref={semRef} className="h-10 px-3 py-2 ml-5 rounded-[20px] shadow-sm border-gray-300 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-green-login" onChange={handleSubject}>
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
                    <h2 className="text-xl font-Outfit-Bold"><span className="whitespace-nowrap">EXAMINEE DETAILS</span></h2>
                    <input type="file" id="myFiles" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" multiple className="font-Outfit-Regular ml-5" />
                    <button className="bg-green-500 hover:bg-green-400 text-white font-Outfit-Bold h-10 w-[10rem] rounded-[20px]" onClick={handleFiles}>UPLOAD FILE</button>
                </div>
            </div>

            <div className="px-8 pt-6 my-1">
                <h2 className="text-xl font-Outfit-Bold mb-3">ADD EXAMS</h2>
                <form ref={formRef} className="flex flex-col st:flex-row justify-between" onSubmit={handleSchedule}>
                    <Input input_id="date" title="Date" inputRef={dateRef} type="date" placeholder="09-09-2020" />
                    <DropDownInput input_id="time" title="Time" inputRef={timeRef} options={['AM', 'PM']} />
                    {/* <DropDownInput input_id="branch" title="Branches" inputRef={branchRef} options={['CS', 'CC', 'CA', 'AD', 'CE', 'EC', 'EE', 'ME']} isTarget handleSubCode={handleSubCode} /> */}
                    <DropDownInput input_id="branch" title="Branches" inputRef={branchRef} options={['CS', 'EC', 'EE', 'CV']} isTarget handleUpdate={handleSubject} />
                    <DropDownInput input_id="subject" title="Subject" inputRef={subjectRef} options={subjectArray} isTarget handleUpdate={handleSubCode} />
                    <DropDownInput input_id="subjectCode" title="Subcode" inputRef={subcodeRef} options={subCodeArray} />
                    <button className="bg-blue-500 hover:bg-blue-400 text-white font-Outfit-Bold py-1 px-2 my-7 mx-2 h-10 w-[5rem] rounded-[20px]" type="submit">ADD</button>
                </form>
            </div>

            <div className="px-8 py-5">
                <h2 className="text-xl font-Outfit-Bold mb-4">EXAM SCHEDULES</h2>
                <div className="h-72 overflow-y-auto relative">
                    <table className="table-auto w-full">
                        <thead className="sticky top-0">
                            <tr className="bg-grey-all font-Outfit-Bold">
                                <th className="text-center px-4 py-2 rounded-tl-2xl rounded-bl-2xl"><span className="whitespace-nowrap">Date</span></th>
                                <th className="text-center px-4 py-2"><span className="whitespace-nowrap">Time</span></th>
                                <th className="text-center px-4 py-2"><span className="whitespace-nowrap">Semester</span></th>
                                <th className="text-center px-4 py-2"><span className="whitespace-nowrap">Branch</span></th>
                                <th className="text-center px-4 py-2"><span className="whitespace-nowrap">Subject</span></th>
                                <th className="text-center pt-2 rounded-tr-2xl rounded-br-2xl ">
                                    <div className="flex items-center justify-center mb-2">
                                        <div className={`w-9 h-5 rounded-full cursor-pointer flex ${toggle ? "bg-green-600 p-1 pl-2" : "bg-gray-600 p-1"}`}
                                            onClick={handleToggle} title={`${toggle ? "Sort By Date" : "Sort By Branch"}`}>
                                            <div className={`w-3 h-3 rounded-full bg-white ${toggle ? "translate-x-full" : ""}`}></div>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (<tr>
                                <td>
                                    <ThreeCircles
                                        height="65"
                                        width="65"
                                        color="#23ca85"
                                        wrapperStyle={{
                                            "position": "absolute",
                                            "left": "47%",
                                            "top": "48%"
                                        }}
                                        visible={true}
                                    />
                                </td>
                            </tr>) : (sortedExams.map(item => <UeRow key={item._id} id={item._id} date={item.date} time={item.time} sem={item.sem} branch={item.branch} subcode={item.subcode} handleDelete={handleDelete} />))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="px-8 py-4 mt-3">
                <div className="flex flex-row justify-between items-center">
                    <div>
                        <p className="font-Outfit-Regular">No of Exams scheduled : {exams.length}</p>
                    </div>
                    <div className="flex flex-row gap-10">
                        <button className="bg-gray-500 hover:bg-gray-400 text-white font-Outfit-Bold h-10 w-[10rem] rounded-[20px]" onClick={handleClearall}>CLEAR ALL</button>
                        <button className="bg-green-500 hover:bg-green-400 text-white font-bold h-10 w-[10rem] rounded-[20px] font-Outfit-Bold" onClick={handleNext}>NEXT</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
