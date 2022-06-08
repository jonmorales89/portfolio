import $axios from '../plugins/axios.js';
import { format, subDays, subWeeks, addWeeks, addDays, parseISO } from 'date-fns';

const formatDateTime = date => {
    let formatted_date =
        format(addWeeks(parseISO(date), 1), 'yyyy-MM-dd');

    const formatted_time = format(addWeeks(parseISO(date), 1), 'HH:mm:ss');

    return `${formatted_date}T${formatted_time}`;
};

export default {
    namespaced: true,

    state: {
        loading: false,
        snackbar: {
            color: null,
            open: false,
            text: null
        }
    },

    getters: {
        snackbar: state => () =>state.snackbar
    },

    actions: {
        all: async (context, { payload, message }) => {
            await Promise.all(payload).then(() => {
                context.commit('TOGGLE_LOADING');

                context.commit(
                    'TOGGLE_SNACKBAR',
                    { status: 'success', text: message }
                );
            }).catch(error => {
                context.commit('TOGGLE_LOADING');

                context.commit(
                    'TOGGLE_SNACKBAR',
                    { status: 'error', text: error }
                );
            });
        },

        delete: async (context, { start }) => {
            context.commit('TOGGLE_LOADING');

            let api = `${process.env.TEAM_UP_CALENDAR_KEY}/events`;

            const start_date = format(new Date(start), 'yyyy-MM-dd');

            const end_date = format(subDays(addWeeks(new Date(start), 1), 1), 'yyyy-MM-dd');

            const fetch_api = `${api}?startDate=${start_date}&endDate=${end_date}`;

            const { data } = await context.dispatch('fetch', { api: fetch_api });

            const events = data.events;

            let promises = [];

            events.forEach(event => {
                promises.push($axios.delete(`${api}/${event.id}?version=${event.version}`));
            });

            await context.dispatch(
                'all',
                { payload: promises, message: 'Week deleted successfully' }
            );
        },

        fetch: async (context, {api}) => {
            let data;
            try {
                data = await $axios.get(api);

                return data;
            } catch(error) {
                console.log(error);
            }
        },

        generate: async (context, { start }) => {
            context.commit('TOGGLE_LOADING');

            let api = `${process.env.TEAM_UP_CALENDAR_KEY}/events`;

            const start_date = format(subWeeks(new Date(start), 1), 'yyyy-MM-dd');

            const end_date = format(subDays(new Date(start), 1), 'yyyy-MM-dd');

            api = `${api}?startDate=${start_date}&endDate=${end_date}`;

            const { data } = await context.dispatch('fetch', { api });

            await context.dispatch('parse', { events: data.events });
        },

        parse: async (context, { events }) => {
            let payload = [];

            events.forEach((event) => {
                payload.push({
                    subcalendar_id: event.subcalendar_id,
                    subcalendar_ids: event.subcalendar_ids,
                    all_day: false,
                    title: event.title,
                    start_dt: formatDateTime(event.start_dt),
                    end_dt: formatDateTime(event.end_dt)
                });
            });

            await context.dispatch('persistAll', { events: payload });
        },

        persist: async (context, {api, type, body}) => {
            let data;
            try {
                data = await $axios[type](api, body);

                return data;
            } catch(error) {
                console.log(error);
            }
        },

        persistAll: async (context, { events }) => {
            let promises = [];

            events.forEach(event => {
                const api = `${process.env.TEAM_UP_CALENDAR_KEY}/events`;

                promises.push($axios.post(api, event))
            });

           await context.dispatch('all', {
               payload: promises,
               message: 'Week generated successfully'
           });
        }
    },

    mutations: {
        TOGGLE_SNACKBAR: (state, { status = null, text = null }) => {
            state.snackbar.open = !state.snackbar.open;
            state.snackbar.color = status;
            state.snackbar.text = text;
        },

        TOGGLE_LOADING: state => {
            state.loading = !state.loading
        }
    }
}