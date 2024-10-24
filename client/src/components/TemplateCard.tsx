import {Link} from "react-router-dom";
import {FILL_TEMPLATE_ROUTE} from "@/utils/routes.ts";
import {TemplateData} from "@/types";
import {AspectRatio} from "@/components/ui/aspect-ratio.tsx";
import {ImageOff} from "lucide-react";
import {FaCalendar, FaComment, FaFile, FaHeart, FaLightbulb, FaLock, FaLockOpen, FaUser} from "react-icons/fa6";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {useTranslation} from "react-i18next";

const TemplateCard = ({template}: { template: TemplateData }) => {
    const {t} = useTranslation()
    const authState = useSelector(selectAuthState)
    const [info, _setInfo] = useState([
        {icon: <FaUser/>, text: template.user.username},
        {icon: <FaCalendar/>, text: new Date(template.createdAt).toLocaleDateString()},
        {icon: <FaLightbulb/>, text: template.topic.name},
        {icon: <FaFile/>, text: template._count?.form},
        {icon: <FaHeart/>, text: template._count?.like},
        {icon: <FaComment/>, text: template._count?.comment},
    ])

    const [isAllowed, setIsAllowed] = useState(true)

    useEffect(() => {
        if (template?.mode === 'public') return
        if (!authState?.id) {
            setIsAllowed(false)
            return;
        }
        if (!template.allowedUsers.find(user => user.id === authState.id) && template.user.id !== authState.id) {
            setIsAllowed(false)
        }

    }, [authState?.id]);

    return (
        <li
            key={template.id}
            className={'w-full bg-accent rounded-md overflow-hidden h-fit'}
        >
            <Link to={`${FILL_TEMPLATE_ROUTE}/${template.id}`}
                  className={`${!isAllowed && 'pointer-events-none'}`}>
                <AspectRatio
                    ratio={16 / 9}
                    className="p-2 relative bg-primary-foreground rounded-md overflow-hidden justify-center  flex flex-col items-center">
                    {
                        template.image ?
                            <img
                                className={'w-full h-full object-cover absolute top-0 right-0'}
                                alt={'image'}
                                src={template.image}
                            />
                            :
                            <ImageOff className={'w-full h-1/4 min-h-[20px]'}/>
                    }
                    {
                        !isAllowed
                            ?
                            <div className={'absolute top-0 right-0 w-full h-full flex justify-center items-center bg-red-600 bg-opacity-50'}>
                                <FaLock/>
                            </div>
                            :
                            template?.mode === 'private' &&
                            <TooltipProvider >
                                <Tooltip >
                                    <TooltipTrigger asChild>
                                        <div
                                            className={'bg-primary-foreground p-1.5 2xl:p-2 absolute top-1 left-1 rounded-md aspect-square flex justify-center items-center  '}>
                                            <FaLockOpen className={'w-full h-[10px] md:h-[12px] 2xl:h-[16px]'}/>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent  align={'start'}>
                                        <p>{t('you-have-access-to-template')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                    }
                </AspectRatio>
            </Link>
            <div className={'2xl:gap-2 p-1 2xl:p-2 flex flex-col gap-1'}>
                <p title={template.title} className={'text-sm lg:text-base h-[1.5em] truncate'}>{template.title}</p>
                <ul className={'w-full flex flex-wrap gap-1'}>
                    {
                        info.map((i, index) =>
                            <li key={index}
                                className="flex gap-1 2xl:gap-2 text-xs 2xl:text-sm p-1.5 2xl:p-2 items-center bg-primary-foreground  rounded-md max-w-full">
                                {i.icon}
                                <p className="block  truncate">
                                    {i.text}
                                </p>
                            </li>
                        )
                    }
                </ul>
            </div>

        </li>
    );
};

export default TemplateCard;
