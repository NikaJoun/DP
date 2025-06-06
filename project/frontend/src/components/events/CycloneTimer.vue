<template>
  <div class="cyclone-timer">
    <h3 v-if="isEventActive">До окончания мероприятия</h3>
    <h3 v-else-if="isEventFinished">Мероприятие завершено</h3>
    <h3 v-else>До начала мероприятия</h3>
    
    <div v-if="!isEventFinished" class="timer-display">
      <div v-if="showDays" class="time-block">
        <span class="time-value">{{ timeValues.days }}</span>
        <span class="time-label">дней</span>
      </div>
      <div class="time-block">
        <span class="time-value">{{ timeValues.hours }}</span>
        <span class="time-label">часов</span>
      </div>
      <div class="time-block">
        <span class="time-value">{{ timeValues.minutes }}</span>
        <span class="time-label">минут</span>
      </div>
      <div class="time-block">
        <span class="time-value">{{ timeValues.seconds }}</span>
        <span class="time-label">секунд</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    eventDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      timeValues: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      isEventActive: false,
      isEventFinished: false,
      timer: null,
      showDays: false
    }
  },
  mounted() {
    this.startTimer();
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    startTimer() {
      this.timer = setInterval(() => {
        this.updateTimer();
      }, 1000);
      this.updateTimer();
    },
    updateTimer() {
      const now = new Date();
      const startDate = new Date(this.eventDate);
      const endDate = new Date(this.endDate);

      if (now < startDate) {
        this.isEventActive = false;
        this.isEventFinished = false;
        this.calculateTime(startDate - now);
        this.showDays = this.timeValues.days > 0;
      } else if (now >= startDate && now < endDate) {
        this.isEventActive = true;
        this.isEventFinished = false;
        this.calculateTime(endDate - now);
        this.showDays = this.timeValues.days > 0;
      } else {
        this.isEventActive = false;
        this.isEventFinished = true;
        clearInterval(this.timer);
      }
    },
    calculateTime(diff) {
      this.timeValues.days = Math.floor(diff / (1000 * 60 * 60 * 24));
      this.timeValues.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.timeValues.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      this.timeValues.seconds = Math.floor((diff % (1000 * 60)) / 1000);
    }
  }
}
</script>
  
<style scoped>
  .cyclone-timer {
    background-color: #E3E6EB;
    padding: 15px 45px;
    border-radius: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  .cyclone-timer h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .timer-display {
    display: flex;
    gap: 5px;
    margin-top: 5px;
  }

  .time-block {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .time-value {
    font-size: .8rem;
    font-weight: bold;
    color: #333;
  }

  .time-label {
    font-size: .8rem;
    color: #666;
  }
</style>