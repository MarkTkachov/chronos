import { FC, useMemo } from "react";
import { useAppSelector } from "../../redux/store";
import { Collapse } from "antd-mobile";
import { CalendarSelector } from "./CalendarSelector";

export const CalendarSelectorBlock: FC = () => {
    const calendars = useAppSelector(state => state.calendars.calendars);


    const localCalendars = useMemo(() => {
        return calendars.filter(cal => cal.type == 'local');
    }, [calendars]);

    const importedCalendars = useMemo(() => {
        return calendars.filter(cal => cal.type == 'imported');
    }, [calendars]);


    return (
        <>

            <Collapse defaultActiveKey={['local', 'imported']}>
                {/* local calendars */}
                <Collapse.Panel key="local" title={'Local calendars'}>
                    {localCalendars.map((cal) => <CalendarSelector key={cal._id} cal={cal} />)}
                </Collapse.Panel>
                {/* imported calendars */}
                <Collapse.Panel key="imported" title={'Imported calendars'}>
                    {importedCalendars.map((cal) => <CalendarSelector key={cal._id} cal={cal} />)}
                </Collapse.Panel>
            </Collapse>


        </>
    );
}
