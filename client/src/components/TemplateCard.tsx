import {Link} from "react-router-dom";
import {FILL_TEMPLATE_ROUTE} from "@/utils/routes.ts";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {TemplateData} from "@/types";

const TemplateCard = ({template}: {template: TemplateData}) => {
    return (
        <li
            key={template.id}
            className={'w-full'}
        >
            <Link to={`${FILL_TEMPLATE_ROUTE}/${template.id}`}>
                <div
                    className="p-2 bg-zinc-800 relative overflow-hidden justify-center rounded-md flex flex-col items-center h-[200px]">
                    {
                        template.image &&
                        <img
                            className={'w-full h-full object-cover absolute top-0 right-0'}
                            alt={'image'}
                            src={template.image}
                        />
                    }

                    <Tooltip>
                        <TooltipTrigger asChild className={'z-10'}>
                            <div className={'text-zinc-200 text-center bg-zinc-900 bg-opacity-95 p-2 rounded-md'}>
                                {template.title}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{template.title}</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className={'flex z-40'}>
                        {template.tags.map(i =>
                            <div>{i.name}</div>
                        )}
                    </div>

                    <p className={'bg-zinc-900 text-zinc-100 flex gap-2 p-2 rounded-md mt-2 z-10'}>
                        {/*{`by: ${template.user.username}`}*/}
                        {template.tags.map(tag =>
                            <p>{tag.name}</p>
                        )}
                    </p>




                </div>
            </Link>
        </li>
    );
};

export default TemplateCard;
