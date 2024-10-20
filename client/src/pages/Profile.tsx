import {Tabs, TabsContent, TabsTrigger} from "@/components/ui/tabs";
import {TabsList} from "@/components/ui/tabs.tsx";

const Profile = () => {
    return (
        <section className={'p-4'}>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">

                </TabsContent>
                <TabsContent value="password">

                </TabsContent>
            </Tabs>

        </section>
    );
};

export default Profile;
