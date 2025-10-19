export interface ParsedWeatherCondition {
  icon: string;
  description: string;
  severity: 'good' | 'caution' | 'poor';
}

export function parseMetarConditions(rawMetar: string): ParsedWeatherCondition {
  const upper = rawMetar.toUpperCase();

  if (upper.includes('TS') || upper.includes('TSRA')) {
    return {
      icon: 'thunderstorm',
      description: 'Thunderstorm',
      severity: 'poor'
    };
  }

  if (upper.includes('+RA') || upper.includes('FZRA')) {
    return {
      icon: 'weather_mix',
      description: 'Heavy Rain/Freezing Rain',
      severity: 'poor'
    };
  }

  if (upper.includes('RA')) {
    return {
      icon: 'rainy',
      description: 'Rain',
      severity: 'caution'
    };
  }

  if (upper.includes('SN') || upper.includes('+SN')) {
    return {
      icon: 'ac_unit',
      description: 'Snow',
      severity: 'poor'
    };
  }

  if (upper.includes('FG') || upper.includes('BR')) {
    return {
      icon: 'foggy',
      description: 'Fog/Mist',
      severity: 'caution'
    };
  }

  if (upper.includes('FEW') || upper.includes('SCT')) {
    return {
      icon: 'wb_cloudy',
      description: 'Partly Cloudy',
      severity: 'good'
    };
  }

  if (upper.includes('BKN') || upper.includes('OVC')) {
    return {
      icon: 'cloud',
      description: 'Cloudy/Overcast',
      severity: 'caution'
    };
  }

  if (upper.includes('SKC') || upper.includes('CLR') || upper.includes('CAVOK')) {
    return {
      icon: 'wb_sunny',
      description: 'Clear',
      severity: 'good'
    };
  }

  return {
    icon: 'cloud',
    description: 'Unknown',
    severity: 'caution'
  };
}

export function evaluateBallooningConditions(
  temp: number | null,
  windSpeed: number | null,
  windGust: number | null,
  visibility: number | null,
  flightCategory: string
): {
  suitability: 'excellent' | 'good' | 'marginal' | 'poor';
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 100;

  if (windSpeed !== null) {
    if (windSpeed > 15) {
      score -= 40;
      reasons.push(`High winds: ${windSpeed} kt`);
    } else if (windSpeed > 10) {
      score -= 20;
      reasons.push(`Moderate winds: ${windSpeed} kt`);
    } else if (windSpeed <= 6) {
      reasons.push(`Light winds: ${windSpeed} kt - ideal`);
    }
  }

  if (windGust !== null && windGust > 20) {
    score -= 30;
    reasons.push(`Strong gusts: ${windGust} kt`);
  }

  if (visibility !== null) {
    if (visibility < 3) {
      score -= 30;
      reasons.push(`Low visibility: ${visibility} mi`);
    } else if (visibility >= 10) {
      reasons.push(`Excellent visibility: ${visibility} mi`);
    }
  }

  if (temp !== null) {
    const tempF = (temp * 9/5) + 32;
    if (tempF < 32 || tempF > 95) {
      score -= 20;
      reasons.push(`Extreme temperature: ${tempF.toFixed(0)}°F`);
    }
  }

  if (flightCategory === 'LIFR' || flightCategory === 'IFR') {
    score -= 40;
    reasons.push(`Poor flight category: ${flightCategory}`);
  }

  let suitability: 'excellent' | 'good' | 'marginal' | 'poor';
  if (score >= 80) {
    suitability = 'excellent';
  } else if (score >= 60) {
    suitability = 'good';
  } else if (score >= 40) {
    suitability = 'marginal';
  } else {
    suitability = 'poor';
  }

  return { suitability, reasons };
}

export function formatMetarTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleString();
    }
  } catch (error) {
    return isoString;
  }
}

export function formatTafPeriod(fromTime: string, toTime: string): string {
  try {
    const from = new Date(fromTime);
    const to = new Date(toTime);

    const formatTime = (date: Date) => {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `${formatTime(from)} to ${formatTime(to)}`;
  } catch (error) {
    return `${fromTime} to ${toTime}`;
  }
}
