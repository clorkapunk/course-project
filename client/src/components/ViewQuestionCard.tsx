import {AnsweredQuestionDataWithId} from "@/pages/FillTemplate.tsx";
import {FaLock} from "react-icons/fa6";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {LOGIN_ROUTE} from "@/utils/routes.ts";

const ViewQuestionCard = ({item}: {
    item: AnsweredQuestionDataWithId
}) => {
    const navigate = useNavigate()

    return (
        <li className={`bg-zinc-800 rounded-md flex flex-col overflow-hidden gap-4`}>
            <div className={'flex flex-col gap-2 p-8 pb-0'}>
                <h3 className={'text-xl text-zinc-200 text-wrap'}>{item.question}</h3>
                <p className={'text-md text-zinc-400 text-wrap'}>{item.description}</p>
            </div>

            <div className={'p-8 pt-4 bg-gradient-to-b from-transparent to-zinc-950 flex items-center justify-center'}>

                <Button variant={'dark'} size={'sm'} onClick={() => navigate(LOGIN_ROUTE)}>
                    <FaLock className={'mr-2'}/> Login to answer questions
                </Button>

            </div>

        </li>
    );
};

export default ViewQuestionCard;
