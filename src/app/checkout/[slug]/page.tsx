import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { initiateCourseOrderAction } from "@/app/actions/checkout";

interface CheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/checkout/${slug}`);
  }

  const course = await db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: true,
      enrollments: {
        where: { userId: user.id },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Free course policy: Zero-price courses bypass payment checkout entirely
  if (course.price <= 0) {
    redirect(`/courses/${course.slug}`);
  }

  // Already enrolled check
  if (course.enrollments.length > 0) {
    redirect(`/courses/${course.slug}/learn`);
  }

  // Retrieve or create canonical order with database price
  const orderData = await initiateCourseOrderAction(course.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 w-full">
        <CheckoutClient
          course={{
            id: course.id,
            title: course.title,
            slug: course.slug,
            price: course.price,
            category: { name: course.category.name },
            instructor: { name: course.instructor.name },
            thumbnail: course.thumbnail,
          }}
          order={{
            id: orderData.orderId,
            orderNumber: orderData.orderNumber,
            amount: orderData.amount,
            currency: orderData.currency,
          }}
          user={{
            name: user.name,
            email: user.email,
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
