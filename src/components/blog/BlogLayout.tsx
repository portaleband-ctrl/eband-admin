import { ReactNode } from "react";
import BlogHeader from "./BlogHeader";
import BlogFooter from "./BlogFooter";

interface BlogLayoutProps {
  children: ReactNode;
}

const BlogLayout = ({ children }: BlogLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />
      <main className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
};

export default BlogLayout;
