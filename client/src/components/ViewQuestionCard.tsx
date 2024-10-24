import {AnsweredQuestionDataWithId} from "@/pages/FillTemplate.tsx";
import {FaLock} from "react-icons/fa6";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {LOGIN_ROUTE} from "@/utils/routes.ts";
import {useTranslation} from "react-i18next";

const ViewQuestionCard = ({item}: {
    item: AnsweredQuestionDataWithId
}) => {
    const navigate = useNavigate()
    const {t} = useTranslation()

    return (
        <li className={`bg-accent rounded-md flex flex-col overflow-hidden gap-4`}>
            <div className={'flex flex-col gap-1 md:gap-2 p-4 2xl:p-8 pb-0'}>
                <h3 className={'text-xl text-wrap text-center md:text-left'}>{item.question}</h3>
                <p className={'text-md opacity-90 text-wrap text-center md:text-left'}>{item.description}</p>
            </div>


            <div className={'p-4 md:p-8 pt-2 md:pt-4 bg-gradient-to-b from-transparent to-background flex items-center justify-center'}>

                <Button size={'sm'} onClick={() => navigate(LOGIN_ROUTE)}>
                    <FaLock className={'mr-2'}/> {t('login-to-answer-questions')}
                </Button>
            </div>

        </li>
    );
};

export default ViewQuestionCard;
