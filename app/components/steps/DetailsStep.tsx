"use client";

import { useState } from "react";

export interface CustomerDetails {
    fullName: string;
    phone: string;
    email: string;
}

interface DetailsStepProps {
    data: CustomerDetails;
    onChange: (data: CustomerDetails) => void;
    onNext: () => void;
}

export default function DetailsStep({
    data,
    onChange,
    onNext,
}: DetailsStepProps) {
    const [errors, setErrors] = useState<Partial<CustomerDetails>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validate = (): boolean => {
        const newErrors: Partial<CustomerDetails> = {};

        if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!data.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^\+?[\d\s()-]{7,}$/.test(data.phone))
            newErrors.phone = "Enter a valid phone number";
        if (!data.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
            newErrors.email = "Enter a valid email address";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field: keyof CustomerDetails) => {
        setTouched({ ...touched, [field]: true });
        validate();
    };

    const handleSubmit = () => {
        setTouched({ fullName: true, phone: true, email: true });
        if (validate()) {
            onNext();
        }
    };

    return (
        <div className="step-content">
            <h2 className="step-title">Your Details</h2>
            <p className="step-subtitle">Tell us who you are so we can reach you</p>

            <div className="form-fields">
                <div className="input-group">
                    <label htmlFor="fullName" className="input-label">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        className={`input-field ${touched.fullName && errors.fullName ? "error" : ""
                            }`}
                        placeholder="e.g. Jane Smith"
                        value={data.fullName}
                        onChange={(e) => onChange({ ...data, fullName: e.target.value })}
                        onBlur={() => handleBlur("fullName")}
                        autoComplete="name"
                    />
                    <span className="input-error">
                        {touched.fullName && errors.fullName}
                    </span>
                </div>

                <div className="input-group">
                    <label htmlFor="phone" className="input-label">
                        Phone Number (WhatsApp)
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        className={`input-field ${touched.phone && errors.phone ? "error" : ""
                            }`}
                        placeholder="+1 (302) 000-0000"
                        value={data.phone}
                        onChange={(e) => onChange({ ...data, phone: e.target.value })}
                        onBlur={() => handleBlur("phone")}
                        autoComplete="tel"
                    />
                    <span className="input-error">
                        {touched.phone && errors.phone}
                    </span>
                </div>

                <div className="input-group">
                    <label htmlFor="email" className="input-label">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={`input-field ${touched.email && errors.email ? "error" : ""
                            }`}
                        placeholder="jane@example.com"
                        value={data.email}
                        onChange={(e) => onChange({ ...data, email: e.target.value })}
                        onBlur={() => handleBlur("email")}
                        autoComplete="email"
                    />
                    <span className="input-error">
                        {touched.email && errors.email}
                    </span>
                </div>
            </div>

            <div className="step-navigation">
                <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={handleSubmit}
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}
