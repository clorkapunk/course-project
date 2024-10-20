import {QuestionData} from "@/types";

const ViewQuestionCard = ({item}: {item: QuestionData}) => {
    return (
        <li className={`p-8 bg-zinc-800 rounded-md flex flex-col gap-8`}>
            <div className={'flex flex-col gap-2'}>
                <h3 className={'text-xl text-zinc-200 text-wrap'}>{item.question}</h3>
                <p className={'text-md text-zinc-400 text-wrap'}>{item.description}</p>
            </div>
        </li>
    );
};

export default ViewQuestionCard;
