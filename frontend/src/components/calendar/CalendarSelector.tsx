import { Dialog, Modal, Popover, Toast } from "antd-mobile";
import { DeleteOutline, EditSOutline, LinkOutline, MoreOutline, SendOutline } from "antd-mobile-icons";
import { Action } from "antd-mobile/es/components/popover";
import axios from "axios";
import { FC, useMemo } from "react";
import styled from "styled-components";
import refreshOnDemand from "../../helpers/refreshOnDemand";
import { fetchAllCalendarsWithEvents, toggleCalSelection } from "../../redux/calendarsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { ICalendar } from "../../types/calendars";
import { EditCalendarForm } from "./EditCalendarForm";
import { ShareCalendarForm } from "./ShareCalendarForm";


const GridContainer = styled.div<{ $color?: string }>`
    box-sizing: border-box;
    padding: 5px;

    color: black;
    font-size: large;


    display: grid;
    grid-template-columns: 40px auto 40px;
    grid-template-rows: auto;
    grid-template-areas: "check title options";
    align-items: center;

    & .check {
        justify-self: start;
        grid-area: check;
        accent-color: ${props => props.$color || 'blue'};
        
        input {
            height: 20px;
            width: 20px;
        }
    }

    & .title {
        justify-self: start;
        grid-area: title;
        overflow-x: scroll;
        overflow-y: hidden;

        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    & .options {
        justify-self: end;
        grid-area: options;
    }
`

export const CalendarSelector: FC<{ cal: ICalendar }> = ({ cal }) => {
    const dispatch = useAppDispatch();
    const userEmail = useAppSelector(state => state.auth.user?.email);
    const isEmailVerified = useAppSelector(state => state.auth.user?.emailVerified);

    const toggleSelect = () => {
        dispatch(toggleCalSelection(cal._id));
    }

    const options: Action[] = useMemo(() => {
        let res = userEmail == cal.creatorEmail
            ? [
                { key: 'edit', icon: <EditSOutline />, text: 'Edit' },
                { key: 'share', icon: <LinkOutline />, text: 'Share' },
                { key: 'export', icon: <SendOutline />, text: 'Export iCal' },
                { key: 'deleteFromAll', icon: <DeleteOutline color="red" />, text: 'Delete for all users' },
                { key: 'deleteFromMe', icon: <DeleteOutline />, text: 'Delete for me' },
            ]
            : [
                { key: 'edit', icon: <EditSOutline />, text: 'Edit' },
                { key: 'share', icon: <LinkOutline />, text: 'Share' },
                { key: 'export', icon: <SendOutline />, text: 'Export iCal' },
                { key: 'deleteFromMe', icon: <DeleteOutline />, text: 'Delete for me' },
            ]
        // if not verified email - remove share option
        if (!isEmailVerified) res = res.filter(opt => opt.key !== 'share');
        if (cal.isDefault) res = res.filter(opt => opt.key !== 'deleteFromAll' && opt.key !== 'deleteFromMe');
        if (cal.creatorEmail != userEmail) res = res.filter(opt => opt.key !== 'deleteFromAll');
        return res;
    },
        [userEmail, cal, isEmailVerified]);

    const optionsHandlers: {
        edit: () => Promise<void>,
        share: () => Promise<void>,
        export: () => Promise<void>,
        deleteFromAll: () => Promise<void>,
        deleteFromMe: () => Promise<void>,
        [index: string]: () => Promise<void>
    } = useMemo(() => ({
        share: async () => {
            // open window to enter email to share with whom, do request
            const modalHandle = Modal.show({
                content: <ShareCalendarForm closeHandle={() => modalHandle.close()} id={cal._id} />,
                closeOnMaskClick: true,
                showCloseButton: true
            });
        },
        export: async () => {
            // copy link into clipboard
            if (cal.sourceUrl || cal.exportUrl) {
                await navigator.clipboard.writeText(cal.exportUrl || cal.sourceUrl || '');
                Toast.show('iCal link was copied to clipboard');
            }

        },
        deleteFromAll: async () => {
            // do request after confirm
            Dialog.confirm({
                cancelText: 'Cancel',
                confirmText: 'Confirm',
                content: `Are you sure to delete ${cal.title} for all users?`,
                onConfirm: async () => {
                    try {
                        await refreshOnDemand(() => axios.delete(`/calendar/${encodeURIComponent(cal._id)}/delete`, {
                            params: {
                                deleteForAll: true
                            }
                        }));
                        dispatch(fetchAllCalendarsWithEvents());
                    } catch (error) {
                        if (axios.isAxiosError(error)) {
                            Toast.show(error.response?.data.message);
                        }
                    }
                }
            })

        },
        deleteFromMe: async () => {
            //do request after confirm
            Dialog.confirm({
                cancelText: 'Cancel',
                confirmText: 'Confirm',
                content: `Are you sure to delete ${cal.title} for yourself?`,
                onConfirm: async () => {
                    try {
                        await refreshOnDemand(() => axios.delete(`/calendar/${encodeURIComponent(cal._id)}/delete`, {
                            params: {
                                deleteForAll: false
                            }
                        }));
                        dispatch(fetchAllCalendarsWithEvents());
                    } catch (error) {
                        if (axios.isAxiosError(error)) {
                            Toast.show(error.response?.data.message);
                        }
                    }
                }
            })

        },
        edit: async () => {
            //show window
            const modalHandle = Modal.show({
                content: <EditCalendarForm
                    cal={cal}
                    refreshCalendars={() => dispatch(fetchAllCalendarsWithEvents())}
                    closeForm={() => modalHandle.close()}
                />,
                closeOnMaskClick: true,
                showCloseButton: true
            })
        }
    }), [cal])


    return (
        <>
            <GridContainer $color={cal.color}>
                <span className="check">
                    <input type="checkbox" checked={cal.selected} onChange={toggleSelect} />
                </span>
                <span className="title">
                    {cal.title}
                </span>
                <span className="options">
                    {/* options button */}
                    <Popover.Menu
                        actions={options}
                        trigger="click"
                        onAction={(opt => {
                            if (typeof opt.key === 'string') optionsHandlers[opt.key]();
                        })}
                    >
                        <MoreOutline fontSize={30} />
                    </Popover.Menu>

                </span>

            </GridContainer>
        </>
    );
}
