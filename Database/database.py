import psycopg2

# ==========================================
# PostgreSQL DATABASE CONFIGURATION
# ==========================================

DB_HOST = "localhost"
DB_PORT = 5432

# IMPORTANT:
# Use the exact database name shown in pgAdmin.
DB_NAME = "transport_ai"

DB_USER = "postgres"

# CHANGE THIS
DB_PASSWORD = "password"


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_connection():

    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


# ==========================================
# TEST DATABASE
# ==========================================

def test_connection():

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT current_database(), current_user;"
        )

        database, user = cursor.fetchone()

        print("===================================")
        print("DATABASE CONNECTED SUCCESSFULLY")
        print("===================================")
        print("Database :", database)
        print("User     :", user)

        cursor.close()
        conn.close()

        return True

    except Exception as e:

        print("DATABASE CONNECTION ERROR")
        print(e)

        return False


# ==========================================
# SAVE YOLO DETECTION
# ==========================================

def save_detection(
        camera_id,
        class_name,
        confidence,
        x1,
        y1,
        x2,
        y2,
        tracking_id=None):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO detections
    (
        camera_id,
        class_name,
        confidence,
        x1,
        y1,
        x2,
        y2,
        tracking_id
    )
    VALUES
    (%s,%s,%s,%s,%s,%s,%s,%s)
    RETURNING id;
    """

    cursor.execute(
        query,
        (
            camera_id,
            class_name,
            float(confidence),
            int(x1),
            int(y1),
            int(x2),
            int(y2),
            tracking_id
        )
    )

    detection_id = cursor.fetchone()[0]

    conn.commit()

    cursor.close()
    conn.close()

    return detection_id


# ==========================================
# SAVE NUMBER PLATE
# ==========================================

def save_number_plate(
        detection_id,
        plate_number,
        confidence,
        image_path=None):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO number_plates
    (
        detection_id,
        plate_number,
        confidence,
        image_path
    )
    VALUES
    (%s,%s,%s,%s);
    """

    cursor.execute(
        query,
        (
            detection_id,
            plate_number,
            float(confidence),
            image_path
        )
    )

    conn.commit()

    cursor.close()
    conn.close()


# ==========================================
# SAVE TRAFFIC ANALYTICS
# ==========================================

def save_analytics(camera_id, counts):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO traffic_analytics
    (
        camera_id,
        autorickshaw,
        bicycle,
        bus,
        car,
        motorcycle,
        person,
        traffic_light,
        traffic_sign,
        truck
    )
    VALUES
    (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);
    """

    cursor.execute(
        query,
        (
            camera_id,

            counts.get("autorickshaw", 0),
            counts.get("bicycle", 0),
            counts.get("bus", 0),
            counts.get("car", 0),
            counts.get("motorcycle", 0),
            counts.get("person", 0),
            counts.get("traffic light", 0),
            counts.get("traffic sign", 0),
            counts.get("truck", 0)
        )
    )

    conn.commit()

    cursor.close()
    conn.close()


# ==========================================
# SAVE EVENT
# ==========================================

def save_event(
        camera_id,
        event_type,
        severity,
        description):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO events
    (
        camera_id,
        event_type,
        severity,
        description
    )
    VALUES
    (%s,%s,%s,%s);
    """

    cursor.execute(
        query,
        (
            camera_id,
            event_type,
            severity,
            description
        )
    )

    conn.commit()

    cursor.close()
    conn.close()


# ==========================================
# RUN TEST
# ==========================================

if __name__ == "__main__":

    test_connection()