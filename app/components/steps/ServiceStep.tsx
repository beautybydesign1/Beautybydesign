"use client";

import { useState } from "react";
import { Service, services } from "@/app/data/services";

interface ServiceStepProps {
    selectedServices: Service[];
    date: string;
    time: string;
    onSelectServices: (services: Service[]) => void;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const TIME_SLOTS = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
];

export default function ServiceStep({
    selectedServices,
    date,
    time,
    onSelectServices,
    onDateChange,
    onTimeChange,
    onNext,
    onBack,
}: ServiceStepProps) {
    const [errors, setErrors] = useState<{ services?: string; date?: string; time?: string }>({});

    const toggleService = (service: Service) => {
        const isSelected = selectedServices.some((s) => s.id === service.id);
        if (isSelected) {
            onSelectServices(selectedServices.filter((s) => s.id !== service.id));
        } else {
            onSelectServices([...selectedServices, service]);
        }
    };

    const handleNext = () => {
        const newErrors: typeof errors = {};
        if (selectedServices.length === 0) newErrors.services = "Please select at least one service";
        if (!date) newErrors.date = "Please select a date";
        if (!time) newErrors.time = "Please select a time";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) onNext();
    };

    // Get today as min date
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="step-content">
            <h2 className="step-title">Choose Your Service</h2>
            <p className="step-subtitle">Select one or more services, then pick a date & time</p>

            <div className="form-fields">
                <div>
                    {services.map((service) => {
                        const isSelected = selectedServices.some((s) => s.id === service.id);
                        return (
                            <div
                                key={service.id}
                                className={`service-card ${isSelected ? "selected" : ""}`}
                                onClick={() => toggleService(service)}
                                role="checkbox"
                                aria-checked={isSelected}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleService(service);
                                    }
                                }}
                                style={{ marginBottom: 12 }}
                            >
                                <img
                                    src={service.imageUrl}
                                    alt={service.title}
                                    className="service-card-image"
                                    loading="lazy"
                                />
                                <div className="service-card-content">
                                    <span className="service-card-title">{service.title}</span>
                                    <span className="service-card-desc">{service.description}</span>
                                    <div className="service-card-meta">
                                        <span className="service-card-price">
                                            ${service.price}
                                        </span>
                                        <span className="service-card-duration">
                                            {service.durationMins} mins
                                        </span>
                                    </div>
                                </div>
                                <div className="service-card-check">
                                    {isSelected && (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path
                                                d="M3 7L6 10L11 4"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {errors.services && (
                        <span className="input-error">{errors.services}</span>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="date" className="input-label">
                        Preferred Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        className={`input-field ${errors.date ? "error" : ""}`}
                        value={date}
                        min={today}
                        onChange={(e) => onDateChange(e.target.value)}
                    />
                    {errors.date && (
                        <span className="input-error">{errors.date}</span>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Preferred Time</label>
                    <div className="time-slots">
                        {TIME_SLOTS.map((slot) => (
                            <button
                                key={slot}
                                type="button"
                                className={`time-slot ${time === slot ? "selected" : ""}`}
                                onClick={() => onTimeChange(slot)}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                    {errors.time && (
                        <span className="input-error">{errors.time}</span>
                    )}
                </div>
            </div>

            <div className="step-navigation">
                <button type="button" className="btn btn-ghost" onClick={onBack}>
                    ← Back
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={handleNext}
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}
