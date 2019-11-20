<style lang="scss">
    .accent{
        &--text {
            color: #fff !important;
        }
    }
</style>
<template>
    <section>
        <v-card
            :dark="true"
            :shaped="true"
        >
            <v-card-title>
                <h1>Generate Cart Schedule</h1>
            </v-card-title>

            <hr>

            <v-card-text>
                <v-menu
                        ref="menu1"
                        v-model="menu1"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                        <v-text-field
                                v-model="dateFormatted"
                                hint="MM/DD/YYYY format"
                                label="Select a start date"
                                persistent-hint
                                prepend-icon="event"
                                @blur="date = parseDate(dateFormatted)"
                                v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker v-model="date"
                                   :show-current="true"
                                   :dark="true"
                                   no-title
                                   @input="menu1 = false"
                    ></v-date-picker>
                </v-menu>
            </v-card-text>

            <v-card-actions>
                <v-btn
                    text
                    :disabled="!dateFormatted || loading"
                    @click="generateWeek"
                >
                    Generate
                </v-btn>

                <v-btn
                        text
                        :disabled="!dateFormatted || loading"
                        @click="deleteWeek"
                >
                    Delete
                </v-btn>
            </v-card-actions>
        </v-card>

        <v-snackbar
                v-model="snackbar.open"
                :color="snackbar.color"
                :timeout="0"
        >
            {{ snackbar.text }}
            <v-btn
                    :color="snackbar.color"
                    text
                    @click="close"
            >
                Close
            </v-btn>
        </v-snackbar>
    </section>
</template>

<script>
    import { createNamespacedHelpers } from 'vuex';

    const { mapState } = createNamespacedHelpers('Cart');

    export default {
        name: 'CartSchedule.vue',

        data: () => ({
            date: null,
            dateFormatted: null,
            menu1: false
        }),

        computed: {
            ...mapState(['snackbar', 'loading']),

            computedDateFormatted () {
                return this.formatDate(this.date)
            }
        },

        watch: {
            date (val) {
                this.dateFormatted = this.formatDate(this.date)
            }
        },

        methods: {
            deleteWeek() {
                this.$store.dispatch('Cart/delete', { start: this.dateFormatted });

                this.reset();
            },

            close() {
                this.$store.commit('Cart/TOGGLE_SNACKBAR', {});
            },

            formatDate (date) {
                if (!date) return null;

                const [year, month, day] = date.split('-');

                return `${month}/${day}/${year}`
            },

            generateWeek() {
                this.$store.dispatch('Cart/generate', { start: this.dateFormatted });

                this.reset();
            },

            parseDate (date) {
                if (!date) return null;

                const [month, day, year] = date.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            },

            reset() {
                this.date = null;
                this.dateFormatted = null;
            }
        }
    }
</script>